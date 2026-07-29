#!/usr/bin/env node
/**
 * daily.dev statusline for Claude Code
 *
 * Rotating daily.dev headlines while you wait: curated major headlines
 * interleaved with the community's most-upvoted posts of the day.
 *
 * Enabled via this plugin's settings.json:
 *   { "statusLine": { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/statusline/statusline.mjs", "refreshInterval": 10 } }
 *
 * Design constraints:
 * - The statusline command must exit fast: all network I/O happens in a
 *   detached background refresh; the visible line only reads local cache.
 * - Anonymous impression analytics are queued locally and flushed in the
 *   background. Opt out with DAILY_DEV_TELEMETRY=0.
 */
import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  mkdirSync,
  existsSync,
  statSync,
  unlinkSync,
  renameSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CACHE_DIR = join(homedir(), '.cache', 'dailydev-claude');
const CACHE_FILE = join(CACHE_DIR, 'headlines.json');
const IDENTITY_FILE = join(CACHE_DIR, 'identity.json');
const STATE_FILE = join(CACHE_DIR, 'impressions-state.json');
const QUEUE_FILE = join(CACHE_DIR, 'events-queue.jsonl');
const CACHE_TTL_MS = 10 * 60 * 1000; // refresh headlines every 10 min
const ROTATE_SECONDS = 20; // show each headline for ~20s
const IMPRESSION_DEDUP_MS = 30 * 60 * 1000; // log each post at most every 30 min
const ORIGIN = 'https://api.daily.dev';
const API = `${ORIGIN}/graphql`;
const UTM = 'utm_source=claude-code&utm_medium=statusline';

const TELEMETRY_ENABLED = !['0', 'false'].includes(
  process.env.DAILY_DEV_TELEMETRY ?? '',
);
const COLOR_ENABLED = !process.env.NO_COLOR;

function pluginVersion() {
  try {
    const manifest = fileURLToPath(
      new URL('../.claude-plugin/plugin.json', import.meta.url),
    );
    return JSON.parse(readFileSync(manifest, 'utf8')).version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
const APP_VERSION = pluginVersion();

// Both queries are public (no auth): curated headlines + most-upvoted posts.
const QUERY = `query ClaudeCodeStatusline {
  headlines: majorHeadlines(first: 10) {
    edges { node { id headline channel post { id numUpvotes numComments } } }
  }
  popular: mostUpvotedFeed(first: 10, period: 1) {
    edges { node { id title numUpvotes numComments tags } }
  }
}`;

async function refreshCache() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  });
  const { data } = await res.json();
  const seen = new Set();
  const items = [];
  // Interleave curated headlines and popular posts so rotation alternates flavors
  const headlines = (data?.headlines?.edges ?? []).map((e) => ({
    id: e.node.id,
    postId: e.node.post?.id,
    title: e.node.headline,
    numUpvotes: e.node.post?.numUpvotes ?? 0,
    kind: 'headline',
  }));
  const popular = (data?.popular?.edges ?? []).map((e) => ({
    id: e.node.id,
    postId: e.node.id,
    title: e.node.title,
    numUpvotes: e.node.numUpvotes ?? 0,
    kind: 'popular',
  }));
  const max = Math.max(headlines.length, popular.length);
  for (let i = 0; i < max; i++) {
    for (const item of [headlines[i], popular[i]]) {
      if (item && item.postId && !seen.has(item.postId)) {
        seen.add(item.postId);
        items.push(item);
      }
    }
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  // A fresh visit per refresh cycle; the collector dedupes on event_id + visit_id.
  writeFileSync(
    CACHE_FILE,
    JSON.stringify({
      fetchedAt: Date.now(),
      visitId: randomUUID(),
      sessionId: randomUUID(),
      items,
    }),
  );
}

function readCache() {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function cacheIsStale() {
  try {
    return Date.now() - statSync(CACHE_FILE).mtimeMs > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

// --- analytics: impressions into the daily.dev events pipeline (/e) ---
// Anonymous identity: /boot mints a tracking id (same id the webapp uses for a
// logged-out visitor). Persisted once; events carry it as user_id.
async function ensureIdentity() {
  if (existsSync(IDENTITY_FILE)) return;
  let userId;
  try {
    const res = await fetch(`${ORIGIN}/boot?v=claude-code-${APP_VERSION}`, {
      headers: { app: 'claude-code' },
    });
    userId = (await res.json())?.user?.id;
  } catch {
    // offline first run — fall back to a local id
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(
    IDENTITY_FILE,
    JSON.stringify({ userId: userId ?? randomUUID(), deviceId: randomUUID() }),
  );
}

// Impressions are appended to a local queue at render time (must stay fast)
// and flushed here, in the background refresh process. The queue is renamed
// before reading so concurrent render appends land in a fresh file.
async function flushQueue() {
  if (!existsSync(QUEUE_FILE)) return;
  const flushing = `${QUEUE_FILE}.${process.pid}.flushing`;
  try {
    renameSync(QUEUE_FILE, flushing);
  } catch {
    return; // another refresh grabbed it
  }
  const lines = readFileSync(flushing, 'utf8').trim().split('\n');
  const events = lines
    .slice(-200)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (!events.length) {
    unlinkSync(flushing);
    return;
  }
  try {
    const res = await fetch(`${ORIGIN}/e`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    unlinkSync(flushing);
  } catch {
    // put events back for the next flush
    appendFileSync(QUEUE_FILE, `${lines.join('\n')}\n`);
    unlinkSync(flushing);
  }
}

function maybeLogImpression(item, cache) {
  if (!TELEMETRY_ENABLED) return;
  try {
    const identity = JSON.parse(readFileSync(IDENTITY_FILE, 'utf8'));
    let state = {};
    try {
      state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    } catch {
      // first impression
    }
    const now = Date.now();
    const logged = state.logged ?? {};
    if (now - (logged[item.postId] ?? 0) < IMPRESSION_DEDUP_MS) return;
    appendFileSync(
      QUEUE_FILE,
      `${JSON.stringify({
        event_id: `${Math.floor(now / 1000)}${Math.random().toString(36).slice(2, 8)}`,
        event_name: 'impression',
        event_timestamp: new Date(now).toISOString(),
        visit_id: cache.visitId,
        session_id: cache.sessionId,
        user_id: identity.userId,
        device_id: identity.deviceId,
        app_platform: 'claude-code',
        app_version: APP_VERSION,
        target_type: 'post',
        target_id: item.postId,
        feed_item_title: item.title,
        extra: JSON.stringify({
          origin: 'claude code statusline',
          feed: item.kind,
        }),
      })}\n`,
    );
    for (const [id, ts] of Object.entries(logged)) {
      if (now - ts > 2 * IMPRESSION_DEDUP_MS) delete logged[id];
    }
    logged[item.postId] = now;
    writeFileSync(STATE_FILE, JSON.stringify({ logged }));
  } catch {
    // analytics must never break the statusline
  }
}

// --- rendering ---
const style = (code) => (s) => (COLOR_ENABLED ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = style('2');
const bold = style('1');
const purple = style('38;5;135'); // daily.dev accent
const cyan = style('36');
// OSC 8 hyperlink — clickable in iTerm2/Kitty/WezTerm/Ghostty; harmless elsewhere.
// Links hit the click-tracking redirect, which lands on the post page with UTM.
const link = (url, s) => `\x1b]8;;${url}\x1b\\${s}\x1b]8;;\x1b\\`;

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function render(sessionInfo) {
  const cache = readCache();
  const items = cache?.items ?? [];
  const model = sessionInfo?.model?.display_name ?? '';
  const prefix = model ? dim(`${model} · `) : '';

  if (!items.length) {
    return `${prefix}${purple('daily.dev')} ${dim('fetching headlines…')}`;
  }

  const idx = Math.floor(Date.now() / 1000 / ROTATE_SECONDS) % items.length;
  const item = items[idx];
  maybeLogImpression(item, cache);
  const tag = item.kind === 'headline' ? purple('headlines') : cyan('popular');
  const stats = item.numUpvotes > 0 ? dim(` ▲${item.numUpvotes}`) : '';
  const counter = dim(` [${idx + 1}/${items.length}]`);
  const title = link(
    `${ORIGIN}/c/${item.postId}?${UTM}`,
    bold(truncate(item.title, 90)),
  );
  return `${prefix}${purple('daily.dev')} ${tag} ${title}${stats}${counter}`;
}

// --- main ---
if (process.argv[2] === '--refresh') {
  // background mode: fetch headlines, ensure identity, flush queued events
  if (TELEMETRY_ENABLED) {
    await ensureIdentity().catch(() => {});
  }
  await Promise.all([
    refreshCache().catch(() => {}),
    TELEMETRY_ENABLED ? flushQueue().catch(() => {}) : null,
  ]);
  process.exit(0);
}

let sessionInfo = null;
try {
  const stdin = readFileSync(0, 'utf8');
  if (stdin.trim()) sessionInfo = JSON.parse(stdin);
} catch {
  // stdin is optional — render works without it
}

if (cacheIsStale()) {
  // fire-and-forget background refresh so the statusline never blocks on network
  spawn(process.execPath, [fileURLToPath(import.meta.url), '--refresh'], {
    detached: true,
    stdio: 'ignore',
  }).unref();
}

process.stdout.write(render(sessionInfo));
