#!/usr/bin/env node
/**
 * daily.dev statusline for Claude Code
 *
 * Rotating daily.dev headlines while you wait: curated major headlines
 * interleaved with the community's most-upvoted posts of the day.
 *
 * Claude Code does not activate statuslines from plugin settings — users wire
 * this script into their own settings via the /daily.dev:statusline skill
 * (or manually; see the plugin README).
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
const ROTATE_SECONDS = 60; // show each headline for ~60s
// One full rotation of a ~20-item batch takes ~20 min; refresh in step with it
// so every batch gets shown once before the next one replaces it.
const CACHE_TTL_MS = 20 * 60 * 1000;
const HISTORY_FILE = join(CACHE_DIR, 'shown-history.json');
const HISTORY_RETENTION_MS = 24 * 60 * 60 * 1000; // don't repeat a post within a day
const MAX_ITEMS = 20; // batch size per refresh cycle
const MIN_ITEMS = 10; // below this, recycle least-recently-shown items
const IMPRESSION_DEDUP_MS = 30 * 60 * 1000; // log each post at most every 30 min
const ORIGIN = process.env.DAILY_DEV_ORIGIN || 'https://api.daily.dev';
const API = `${ORIGIN}/graphql`;

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

// Single public query (no auth). The API returns fully rendered lines
// (ANSI styling + OSC 8 links to the /c/ click redirect), so content and
// format are controlled server-side and can change without a plugin release.
const QUERY = `query ClaudeCodeStatusline($first: Int) {
  statuslineHeadlines(first: $first)
}`;

// Clicks reach /c/ with the browser's anonymous id, not this plugin's /boot
// identity, so impressions and clicks can't be joined as-is. Tag each /c/
// link with our id as cc_uid: the redirect logs the full query string into
// the click event's query_params but forwards only utm_* to the post page,
// so the id never leaks into webapp URLs. (cc_uid, not userid — that param
// is reserved for referral traffic.)
function tagClickUrls(line) {
  if (!TELEMETRY_ENABLED) return line;
  let userId;
  try {
    userId = JSON.parse(readFileSync(IDENTITY_FILE, 'utf8')).userId;
  } catch {
    return line; // no identity yet (first run offline)
  }
  if (!userId) return line;
  return line.replace(
    /(\x1b\]8;;)([^\x1b]+)(\x1b\\)/g,
    (match, open, url, close) => {
      try {
        const parsed = new URL(url);
        if (!parsed.pathname.startsWith('/c/')) return match;
        parsed.searchParams.set('cc_uid', userId);
        return `${open}${parsed}${close}`;
      } catch {
        return match;
      }
    },
  );
}

// The post id is embedded in each line's /c/ link; used for the no-repeat
// history and impression analytics.
const linePostId = (line) => line.match(/\/c\/([^?\s]+)/)?.[1] ?? null;

async function refreshCache() {
  // Freshness stays client-side: the server returns its current top lines;
  // we skip posts that already rotated through the line in the last 24h and
  // recycle the ones shown longest ago when the unseen pool runs low, so the
  // line never goes blank.
  const prev = readCache();
  const now = Date.now();
  let history = {};
  try {
    history = JSON.parse(readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    // first run
  }
  for (const item of prev?.items ?? []) {
    if (item.postId) history[item.postId] = prev.fetchedAt ?? now;
  }
  for (const [id, ts] of Object.entries(history)) {
    if (now - ts > HISTORY_RETENTION_MS) delete history[id];
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { first: 40 } }),
  });
  const { data } = await res.json();
  const seen = new Set();
  const all = (data?.statuslineHeadlines ?? []).flatMap((line) => {
    const postId = linePostId(line);
    if (seen.has(postId ?? line)) return [];
    seen.add(postId ?? line);
    return [{ line: tagClickUrls(line), postId }];
  });
  let items = all
    .filter((i) => !i.postId || !history[i.postId])
    .slice(0, MAX_ITEMS);
  if (items.length < MIN_ITEMS) {
    const recycled = all
      .filter((i) => i.postId && history[i.postId])
      .sort((a, b) => history[a.postId] - history[b.postId]);
    items = items.concat(recycled.slice(0, MIN_ITEMS - items.length));
  }
  if (!items.length && prev?.items?.length) {
    // fetch came back empty — keep showing the previous batch
    items = prev.items;
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(HISTORY_FILE, JSON.stringify(history));
  // A fresh visit per refresh cycle; the collector dedupes on event_id + visit_id.
  writeFileSync(
    CACHE_FILE,
    JSON.stringify({
      fetchedAt: now,
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

// Plain title for analytics: drop OSC 8 wrappers, SGR codes, the brand
// label, and the trailing upvote count from a server-rendered line.
const plainTitle = (line) =>
  line
    .replace(/\x1b\]8;;[^\x1b\x07]*(?:\x1b\\|\x07)/g, '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/^daily\.dev /, '')
    .replace(/ ▲\d+$/, '');

function maybeLogImpression(item, cache) {
  if (!TELEMETRY_ENABLED || !item.postId) return;
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
        feed_item_title: plainTitle(item.line),
        extra: JSON.stringify({
          origin: 'claude code statusline',
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
const purple = style('38;5;135'); // daily.dev accent
// NO_COLOR strips SGR styling only; OSC 8 hyperlinks stay (they carry no color)
const stripColors = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

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
  return `${prefix}${COLOR_ENABLED ? item.line : stripColors(item.line)}`;
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
