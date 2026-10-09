/**
 * daily.dev mod: rotating headlines with no settings.json edits.
 *
 * Reuses statusline/statusline.mjs unchanged, so caching, the 24h no-repeat
 * history, /c/ click attribution (cc_uid) and impression telemetry
 * (DAILY_DEV_TELEMETRY=0 opts out) behave exactly as today. The script prints
 * the current headline from its local cache and starts a detached background
 * refresh when the cache is stale; this mod polls it and shows the result.
 */
import { atom, read, update } from 'claude-code';
import type { Register } from 'claude-code';
import type { Headline } from '../types';

const POLL_MS = 10_000; // the old statusLine used refreshInterval: 10

const headlineAtom = atom(
  { plugin: 'daily.dev', key: 'headline' } as const,
  undefined as Headline | undefined,
);
const bandHiddenAtom = atom(
  { plugin: 'daily.dev', key: 'bandHidden' } as const,
  false as boolean | undefined,
);

// Turn one server-rendered line into a title and its /c/ link.
function parse(line: string): Headline | undefined {
  const url = line.match(/\x1b\]8;;([^\x1b\x07]+)(?:\x1b\\|\x07)/)?.[1];
  const title = line
    .replace(/\x1b\]8;;[^\x1b\x07]*(?:\x1b\\|\x07)/g, '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/^daily\.dev /, '')
    .trim();
  if (!title || title.endsWith('fetching headlines…')) return undefined;
  return { title, url };
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const result = await next(e);

    const tick = async () => {
      try {
        const out = await $.process.run(
          ['node', `${$.plugin.root}/statusline/statusline.mjs`],
          { stdin: '{}' },
        );
        const headline = parse(String(out.stdout ?? ''));
        await update($, headlineAtom, () => headline);
        $.ui.status(headline ? `daily.dev · ${headline.title}` : undefined);
      } catch {
        // No node on PATH or offline: keep the line empty, never break the session.
        $.ui.status(undefined);
      }
    };

    await tick();
    $.clock.every(POLL_MS, tick);
    return result;
  });

  // Band above the prompt: the same headline with an Open link and Hide.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e); // yield to a survey
    const headline = await read($, headlineAtom);
    const hidden = await read($, bandHiddenAtom);
    if (!headline || hidden) return next(e);
    const { Box, Text, Button, Link } = $.ui.resolve(e);
    return (
      <Box flexDirection="row" gap={1}>
        <Text color="magenta">daily.dev</Text>
        <Text dimColor>{headline.title}</Text>
        {headline.url ? <Link href={headline.url}>Open</Link> : null}
        <Button onPress={() => update($, bandHiddenAtom, () => true)}>Hide</Button>
      </Box>
    );
  });
};
