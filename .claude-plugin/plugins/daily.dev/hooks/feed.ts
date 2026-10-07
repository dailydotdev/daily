/**
 * daily.dev data for the mod: the public GraphQL queries (no auth), the
 * shape the band, status line and pane draw from, and the package-install
 * parser behind the "✨" toasts. Pure functions here; every network call goes
 * through the `Io` the session.start hook builds from `$`.
 */
import type { HttpInit, HttpResponse } from 'claude-code';

/**
 * What the mod's helpers need from the engine. A hooks module spells every
 * engine call as `$.noun.method(...)` at the call site and never hands `$`
 * itself around, so the session.start hook builds this once from closures.
 */
export type Io = {
  fetch: (url: string, init?: HttpInit) => Promise<HttpResponse>;
  now: () => Promise<number>;
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  telemetryEnv: () => Promise<string | undefined>;
  status: (text: string | undefined) => void;
  toast: (text: string, timeoutMs: number) => void;
  redraw: () => void;
  every: (ms: number, fn: () => void) => { cancel: () => void };
};

export const ORIGIN = 'https://api.daily.dev';
const API = `${ORIGIN}/graphql`;

export type Post = {
  id: string;
  title: string;
  upvotes: number;
  comments: number;
  /** curated headline (🔥) or community most-upvoted (⭐) */
  kind: 'headline' | 'popular';
  breaking: boolean;
  /** headline channel (`security`, `backend`, ...) or the post's first tags */
  labels: string[];
};

export type Feed = {
  fetchedAt: number;
  headlines: Post[];
  popular: Post[];
};

const TRENDS_QUERY = `query ClaudeCodeMod {
  headlines: majorHeadlines(first: 12) {
    edges { node { headline channel significance post { id numUpvotes numComments } } }
  }
  popular: mostUpvotedFeed(first: 12, period: 1) {
    edges { node { id title numUpvotes numComments tags } }
  }
}`;

const SEARCH_QUERY = `query ClaudeCodeModSearch($query: String!) {
  searchPosts(query: $query, first: 10) {
    edges { node { id title numUpvotes numComments createdAt tags } }
  }
}`;

type Edges<T> = { edges?: { node?: T }[] } | null | undefined;
type HeadlineNode = {
  headline?: string;
  channel?: string;
  significance?: string;
  post?: { id?: string; numUpvotes?: number; numComments?: number } | null;
};
type PostNode = {
  id?: string;
  title?: string;
  numUpvotes?: number;
  numComments?: number;
  createdAt?: string;
  tags?: string[];
};

const nodes = <T>(e: Edges<T>): T[] =>
  (e?.edges ?? []).flatMap((x) => (x.node ? [x.node] : []));

async function gql(
  io: Io,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<Record<string, unknown> | undefined> {
  const res = await io.fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) return undefined;
  const parsed = JSON.parse(res.text) as { data?: Record<string, unknown> };
  return parsed.data;
}

/** Today's curated headlines and most-upvoted posts, de-duplicated. */
export async function fetchFeed(io: Io, now: number): Promise<Feed | undefined> {
  const data = await gql(io, TRENDS_QUERY);
  if (!data) return undefined;
  const seen = new Set<string>();
  const headlines: Post[] = [];
  for (const n of nodes(data.headlines as Edges<HeadlineNode>)) {
    const id = n.post?.id;
    if (!id || !n.headline || seen.has(id)) continue;
    seen.add(id);
    headlines.push({
      id,
      title: n.headline,
      upvotes: n.post?.numUpvotes ?? 0,
      comments: n.post?.numComments ?? 0,
      kind: 'headline',
      breaking: n.significance === 'breaking',
      labels: n.channel && n.channel !== 'other' ? [n.channel] : [],
    });
  }
  const popular: Post[] = [];
  for (const n of nodes(data.popular as Edges<PostNode>)) {
    if (!n.id || !n.title || seen.has(n.id)) continue;
    seen.add(n.id);
    popular.push({
      id: n.id,
      title: n.title,
      upvotes: n.numUpvotes ?? 0,
      comments: n.numComments ?? 0,
      kind: 'popular',
      breaking: false,
      labels: (n.tags ?? []).slice(0, 3),
    });
  }
  if (!headlines.length && !popular.length) return undefined;
  return { fetchedAt: now, headlines, popular };
}

/** Headlines and popular posts interleaved: what the band rotates through. */
export function rotation(feed: Feed | undefined): Post[] {
  if (!feed) return [];
  const out: Post[] = [];
  const max = Math.max(feed.headlines.length, feed.popular.length);
  for (let i = 0; i < max; i++) {
    const h = feed.headlines[i];
    const p = feed.popular[i];
    if (h) out.push(h);
    if (p) out.push(p);
  }
  // breaking news jumps the queue
  return [...out.filter((p) => p.breaking), ...out.filter((p) => !p.breaking)];
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The best-loved recent post that is really about `pkg`: its name must be in
 * the title, it must be under a year old and have some community signal.
 */
export async function findPostFor(
  io: Io,
  pkg: string,
  now: number,
): Promise<Post | undefined> {
  const term = searchTerm(pkg);
  const needle = squash(term);
  if (needle.length < 3) return undefined;
  const data = await gql(io, SEARCH_QUERY, { query: term });
  if (!data) return undefined;
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const best = nodes(data.searchPosts as Edges<PostNode>)
    .filter((n) => n.id && n.title && squash(n.title).includes(needle))
    .filter((n) => (n.numUpvotes ?? 0) >= 10)
    .filter((n) => !n.createdAt || Date.parse(n.createdAt) >= yearAgo)
    .sort((a, b) => (b.numUpvotes ?? 0) - (a.numUpvotes ?? 0))[0];
  if (!best?.id || !best.title) return undefined;
  return {
    id: best.id,
    title: best.title,
    upvotes: best.numUpvotes ?? 0,
    comments: best.numComments ?? 0,
    kind: 'popular',
    breaking: false,
    labels: (best.tags ?? []).slice(0, 3),
  };
}

/** `@tanstack/react-query` → `react-query`; `github.com/spf13/cobra` → `cobra`. */
export function searchTerm(pkg: string): string {
  const parts = pkg.split('/').filter(Boolean);
  let last = parts[parts.length - 1] ?? pkg;
  // go modules: github.com/foo/bar/v2 → bar
  if (/^v\d+$/.test(last) && parts.length > 1) last = parts[parts.length - 2] ?? last;
  return last.replace(/^@/, '');
}

// --- package installs ---------------------------------------------------

/** verb patterns per package manager; the packages are the words after them */
const INSTALLERS: { re: RegExp; needsArgs?: true }[] = [
  { re: /^(?:npm|cnpm)\s+(?:i|install|add)\b/ },
  { re: /^pnpm\s+(?:add|install|i)\b/ },
  { re: /^yarn\s+(?:global\s+)?add\b/ },
  { re: /^bun\s+(?:add|install|i|a)\b/ },
  { re: /^deno\s+(?:add|install)\b/ },
  { re: /^(?:python3?\s+-m\s+)?pip3?\s+install\b/ },
  { re: /^uv\s+(?:add|pip\s+install)\b/ },
  { re: /^poetry\s+add\b/ },
  { re: /^cargo\s+(?:add|install)\b/ },
  { re: /^go\s+(?:get|install)\b/ },
  { re: /^gem\s+install\b/ },
  { re: /^composer\s+require\b/ },
];

/** Flags that take a value we must skip over (or that mean "not a package"). */
const VALUE_FLAGS = new Set(['--registry', '--prefix', '--filter', '-F', '--workspace', '-w', '--index-url', '-i', '--extra-index-url', '--target', '-t', '--features', '--version', '--save-prefix', '--tag']);
const FILE_FLAGS = new Set(['-r', '--requirement', '-e', '--editable', '-c', '--constraint']);

function clean(raw: string): string | undefined {
  let s = raw.replace(/^['"]|['"]$/g, '');
  if (!s || s.startsWith('.') || s.startsWith('/') || s.startsWith('~')) return undefined;
  if (/^(?:https?:|git\+|git:|file:|link:|workspace:)/.test(s)) return undefined;
  if (/\.(?:whl|tgz|tar\.gz|zip)$/.test(s)) return undefined;
  s = s.replace(/^npm:/, '');
  // npm/go versions: name@1.2.3, @scope/name@^2, github.com/x/y@latest
  const at = s.lastIndexOf('@');
  if (at > 0) s = s.slice(0, at);
  // python extras / versions: name[extra]>=1.0
  s = s.split(/[\[=<>~!;]/)[0] ?? s;
  // cargo/gem/composer version pins: name:1.0
  if (!s.includes('/')) s = s.split(':')[0] ?? s;
  if (s.startsWith('@types/')) return undefined; // type packages are noise
  return /^[@a-zA-Z0-9][\w.\-/@]*$/.test(s) ? s : undefined;
}

/** Package names a shell command installs, across the common package managers. */
export function parseInstalls(command: string): string[] {
  const found: string[] = [];
  for (const segment of command.split(/&&|\|\||;|\||\n/)) {
    const words = segment
      .trim()
      .replace(/^(?:sudo\s+|time\s+|\w+=\S+\s+)+/, '')
      .split(/\s+/)
      .filter(Boolean);
    const line = words.join(' ');
    const hit = INSTALLERS.map((i) => line.match(i.re)).find(Boolean);
    if (!hit) continue;
    const rest = line.slice(hit[0].length).trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < rest.length; i++) {
      const w = rest[i] ?? '';
      if (FILE_FLAGS.has(w)) return found; // -r requirements.txt etc: not a named install
      if (w.startsWith('-')) {
        if (VALUE_FLAGS.has(w)) i++;
        continue;
      }
      const name = clean(w);
      if (name && !found.includes(name)) found.push(name);
    }
  }
  return found;
}

// --- links ----------------------------------------------------------------

/** The /c/ click redirect, attributed to the mod and to where it was shown. */
export function postUrl(id: string, placement: string, ccUid?: string): string {
  const u = new URL(`${ORIGIN}/c/${encodeURIComponent(id)}`);
  u.searchParams.set('utm_source', 'claude-code');
  u.searchParams.set('utm_medium', 'mod');
  u.searchParams.set('utm_content', placement);
  if (ccUid) u.searchParams.set('cc_uid', ccUid);
  return u.toString();
}

/** Cut to `max` cells, ending in an ellipsis; emoji and CJK count double. */
export function fit(text: string, max: number): string {
  const width = (c: string) => (/[ᄀ-￿\u{1F000}-\u{1FFFF}]/u.test(c) ? 2 : 1);
  let out = '';
  let used = 0;
  for (const c of text) {
    const w = width(c);
    if (used + w > max - 1) return `${out.trimEnd()}…`;
    out += c;
    used += w;
  }
  return out;
}

/** `▲123 💬4` with the zero parts left out. */
export function meta(p: Post): string {
  return [p.upvotes ? `▲${p.upvotes}` : '', p.comments ? `💬${p.comments}` : '']
    .filter(Boolean)
    .join(' ');
}
