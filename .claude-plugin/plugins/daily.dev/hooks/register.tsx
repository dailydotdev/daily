/**
 * daily.dev mod for Claude Code: a little magic around the prompt.
 *
 * - Band above the prompt: one rotating daily.dev headline, with a sparkle
 *   sweep each time a new one rotates in. Breaking news jumps the queue.
 * - Status line: the same headline pinned under the prompt, with no
 *   settings.json wiring (the mods successor to statusline/statusline.mjs).
 * - /daily: a pane with today's 🔥 headlines and ⭐ most upvoted posts.
 * - ✨ toasts: install a package and, when the community has a well-loved
 *   recent post about it, the mod surfaces it (rate-limited, never on failure).
 *
 * Data: the public daily.dev GraphQL API, anonymous. Everything is quiet on
 * error: a failed fetch keeps the last batch, a failed hook passes through.
 */
import type { Register } from 'claude-code';
import { fetchFeed, findPostFor, fit, meta, parseInstalls, postUrl, rotation, type Feed, type Io, type Post } from './feed';
import { Telemetry } from './telemetry';

const ROTATE_MS = 60 * 1000; // a headline a minute, like the classic statusline
const REFRESH_MS = 20 * 60 * 1000; // one full rotation per batch
const FLUSH_MS = 5 * 60 * 1000;
const SPARKLE_FRAME_MS = 120; // the engine redraws ten times a second at most
const SPARKLE = ['✦', '✧', '✶', '✷', '✸', '✹', '✺', '✹', '✸', '✷', '✶', '✧', '✦'];
const TOAST_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // same package: once a week
const TOASTS_PER_HOUR = 3;
const PANE_ID = 'daily';

// daily.dev palette
const CABBAGE = '#CE3DF3';
const ONION = '#7147ED';
const BACON = '#FF0E8C';

type Timer = { cancel: () => void };

export const register: Register = (on, options) => {
  const showBand = options.band !== false;
  const showStatus = options.statusline === true;
  const packageToasts = options.packageToasts !== false;
  const telemetry = new Telemetry();

  // Module state: a reload starts it over, the store keeps the feed.
  let feed: Feed | undefined;
  let queue: Post[] = [];
  let index = 0;
  let pinned: { post: Post; reason: string } | undefined; // a ✨ match, shown until the next rotation
  let hidden = false; // ✕ on the band hides it for this session
  let frame = -1; // sparkle frame, -1 when still
  let sparkleTimer: Timer | undefined;
  let legacyStatusline = false; // the old statusline.mjs is wired: don't double up
  let refreshing = false;
  const toastedThisSession = new Set<string>();
  const toastTimes: number[] = [];
  // the engine calls the helpers need, built once in session.start
  let io: Io | undefined;

  const current = (): Post | undefined => pinned?.post ?? queue[index % Math.max(queue.length, 1)];
  const href = (p: Post, placement: string) =>
    postUrl(p.id, placement, telemetry.enabled ? telemetry.identity?.userId : undefined);

  function sparkle(io: Io) {
    sparkleTimer?.cancel();
    frame = 0;
    io.redraw();
    sparkleTimer = io.every(SPARKLE_FRAME_MS, () => {
      frame += 1;
      if (frame >= SPARKLE.length) {
        frame = -1;
        sparkleTimer?.cancel();
        sparkleTimer = undefined;
      }
      io.redraw();
    });
  }

  async function show(io: Io) {
    const post = current();
    if (!post) return;
    const now = await io.now();
    if (showBand && !hidden) telemetry.impression(post, 'band', now);
    if (showStatus && !legacyStatusline) {
      const stats = meta(post);
      io.status(`✦ daily.dev · ${post.breaking ? '🚨 ' : ''}${fit(post.title, 90)}${stats ? ` ${stats}` : ''}`);
      telemetry.impression(post, 'statusline', now);
    }
    sparkle(io);
  }

  async function rotate(io: Io) {
    if (pinned) pinned = undefined;
    else index = (index + 1) % Math.max(queue.length, 1);
    await show(io);
  }

  async function refresh(io: Io) {
    if (refreshing) return;
    refreshing = true;
    try {
      const fresh = await fetchFeed(io, await io.now());
      if (!fresh) return;
      const had = queue.length > 0;
      const before = current()?.id;
      feed = fresh;
      queue = rotation(fresh);
      index = Math.max(0, queue.findIndex((p) => p.id === before));
      await io.set('feed', fresh);
      if (!had) await show(io);
      else io.redraw();
    } catch {
      // keep the last batch
    } finally {
      refreshing = false;
    }
  }

  async function suggestFor(io: Io, packages: string[]) {
    for (const pkg of packages.slice(0, 3)) {
      if (toastedThisSession.has(pkg)) continue;
      toastedThisSession.add(pkg);
      const now = await io.now();
      while (toastTimes.length && now - (toastTimes[0] ?? 0) > 60 * 60 * 1000) toastTimes.shift();
      if (toastTimes.length >= TOASTS_PER_HOUR) return;
      const last = (await io.get(`toasted:${pkg}`)) as number | undefined;
      if (last && now - last < TOAST_COOLDOWN_MS) continue;
      const post = await findPostFor(io, pkg, now);
      if (!post) continue;
      toastTimes.push(now);
      await io.set(`toasted:${pkg}`, now);
      const stats = meta(post);
      io.toast(`✨ daily.dev · ${pkg}: ${fit(post.title, 80)}${stats ? ` ${stats}` : ''}`, 8000);
      telemetry.impression(post, 'toast', now);
      // pin it in the band until the next rotation, so it is one click away
      pinned = { post, reason: `for ${pkg}` };
      await show(io);
      return; // one toast per command
    }
  }

  // --- lifecycle -----------------------------------------------------------

  on('session.start', async ($, e, next) => {
    const result = await next(e);
    if (!e.isInteractive) return result;
    try {
      const engine: Io = {
        fetch: (url, init) => $.http.fetch(url, init),
        now: () => $.clock.now(),
        get: (key) => $.store.get(key),
        set: (key, value) => $.store.set(key, value),
        telemetryEnv: () => $.env.get('DAILY_DEV_TELEMETRY'),
        status: (text) => $.ui.status(text),
        toast: (text, timeoutMs) => $.ui.toast(text, { timeoutMs }),
        redraw: () => $.ui.invalidate('ui.render'),
        every: (ms, fn) => $.clock.every(ms, fn),
      };
      io = engine;
      await $.command.register({
        name: 'daily',
        description: "Today on daily.dev: headlines and the community's most upvoted posts",
      });
      const settings = await $.settings.read();
      const cmd = (settings.statusLine as { command?: unknown } | undefined)?.command;
      legacyStatusline = typeof cmd === 'string' && cmd.includes('statusline.mjs') && /daily/.test(cmd);

      await telemetry.init(engine, options.telemetry !== false);
      const cached = (await engine.get('feed')) as Feed | undefined;
      const now = await engine.now();
      if (cached?.headlines) {
        feed = cached;
        queue = rotation(cached);
        index = Math.floor(now / ROTATE_MS) % Math.max(queue.length, 1);
        await show(engine);
      }
      if (!cached || now - cached.fetchedAt > REFRESH_MS) void refresh(engine);

      io.every(ROTATE_MS, () => void rotate(engine));
      io.every(REFRESH_MS, () => void refresh(engine).then(() => telemetry.flush(engine)));
      io.every(FLUSH_MS, () => void telemetry.flush(engine));

      if (!(await engine.get('welcomed'))) {
        await engine.set('welcomed', true);
        $.ui.toast('✨ daily.dev is here: fresh headlines above your prompt, /daily for the best of today. Tune it in /config.', {
          timeoutMs: 9000,
        });
      }
    } catch {
      // the mod never gets in the way of a session
    }
    return result;
  });

  // --- the band above the prompt -------------------------------------------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const post = current();
    if (!showBand || hidden || !post || e.props.hasSurvey) return next(e);
    const { Box, Text, Button, Link } = $.ui.resolve(e);
    const sparkling = frame >= 0;
    const glyph = SPARKLE[sparkling ? frame : 0] ?? '✦';
    const brand = 'daily.dev';
    // the sweep: one letter of the brand lit per frame
    const lit = sparkling ? Math.min(frame, brand.length) : -1;
    const tag = post.breaking ? '🚨 BREAKING' : pinned ? `✨ ${pinned.reason}` : '';
    const stats = meta(post);
    const room = Math.max(
      12,
      e.props.bodyColumns - (brand.length + 3) - (tag ? tag.length + 2 : 0) - (stats ? stats.length + 1 : 0) - 8,
    );
    return (
      <Box key="band" flexDirection="row" gap={1}>
        <Box flexDirection="row">
          <Text color={sparkling ? BACON : CABBAGE} bold>{`${glyph} `}</Text>
          {[...brand].map((c, i) => (
            <Text key={`b${i}`} color={i === lit ? BACON : i < lit ? CABBAGE : ONION} bold={i === lit || !sparkling}>
              {c}
            </Text>
          ))}
        </Box>
        {tag ? (
          <Text color={post.breaking ? 'error' : CABBAGE} bold>
            {tag}
          </Text>
        ) : null}
        <Link href={href(post, 'band')} label={fit(post.title, room)} />
        {stats ? <Text dimColor>{stats}</Text> : null}
        <Button key="next" label="›" plain dimColor onPress={() => io && void rotate(io)} />
        <Button
          key="hide"
          label="✕"
          plain
          dimColor
          onPress={() => {
            hidden = true;
            $.ui.invalidate('ui.render');
          }}
        />
      </Box>
    );
  });

  // --- /daily: today in a pane ------------------------------------------------

  on('command.run', { command: 'daily' }, async ($) => {
    const opened = await $.ui.open({ id: PANE_ID, title: '✦ daily.dev', focus: true, closeOnEscape: true });
    if (!feed && io) void refresh(io);
    if (!opened.isPlaced) return { text: 'daily.dev: widen the terminal to see the pane.' };
    return {};
  });

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text, Button, Link } = $.ui.resolve(e);
    const width = e.props.bodyColumns;
    const now = await $.clock.now();
    const row = (p: Post, i: number) => {
      telemetry.impression(p, 'pane', now);
      const stats = meta(p);
      const label = p.labels.map((l) => `#${l}`).join(' ');
      return (
        <Box key={`${p.kind}-${p.id}`} flexDirection="row" gap={1}>
          <Text color={ONION}>{`${i + 1}.`.padStart(3)}</Text>
          {p.breaking ? <Text color="error">🚨</Text> : null}
          <Link href={href(p, 'pane')} label={fit(p.title, Math.max(16, width - 10 - stats.length - label.length))} />
          {stats ? <Text dimColor>{stats}</Text> : null}
          {label ? <Text color={CABBAGE}>{label}</Text> : null}
        </Box>
      );
    };
    return (
      <Box key="daily" flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Text color={CABBAGE} bold>
            ✦ Today on daily.dev
          </Text>
          <Button key="refresh" label="↻ refresh" plain dimColor onPress={() => io && void refresh(io)} />
        </Box>
        {feed ? (
          <Box flexDirection="column">
            <Text bold>🔥 Headlines</Text>
            {feed.headlines.slice(0, 8).map(row)}
            <Text> </Text>
            <Text bold>⭐ Most upvoted today</Text>
            {feed.popular.slice(0, 8).map(row)}
          </Box>
        ) : (
          <Text dimColor>Summoning today's headlines…</Text>
        )}
      </Box>
    );
  });

  // --- ✨ package toasts ---------------------------------------------------------

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const result = await next(e);
    if (!packageToasts) return result;
    try {
      if (result.deny || result.isError) return result;
      const packages = parseInstalls(e.command);
      if (packages.length && io) void suggestFor(io, packages);
    } catch {
      // never in the tool's way
    }
    return result;
  }).catch(($, e, next) => next(e)); // replay-safe: a failure here never re-runs the command
};
