import { test, expect, mock } from 'claude-code/testing';
import type { On } from 'claude-code';

// A real line as statusline.mjs printed it on 2026-10-09 (SGR + OSC 8).
const LINE =
  '\x1b[38;5;135mdaily.dev\x1b[0m \x1b]8;;https://api.daily.dev/c/D8LNYgDuu?utm_source=claude-code&utm_medium=statusline&cc_uid=abc\x1b\\' +
  '\x1b[1mWhy the best programmers are switching to Linux\x1b[0m\x1b]8;;\x1b\\ \x1b[2m▲13\x1b[0m';
const FETCHING = '\x1b[38;5;135mdaily.dev\x1b[0m \x1b[2mfetching headlines…\x1b[0m';
const PROPS = { hasSurvey: false, isWorking: false, maxRows: 10 } as any;

const ok = (stdout: string) => ({
  value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
});

// The world beneath the plugin: a session, a clock, nothing drawn by the engine.
function world(on: On, statuses: (string | undefined)[], argvs: (readonly string[])[], stdout: () => string) {
  on('session.start', (_$, e) => ({ cwd: e.cwd }));
  on('ui.status', (_$, e) => { statuses.push(e.text); return { value: undefined }; });
  on('process.run', (_$, e) => { argvs.push(e.argv); return ok(stdout()); });
  on('ui.render', () => ({ type: 'engine', ref: 0 }) as const);
  return mock.clock(on);
}

test('session.start runs the statusline script and pins the headline', async ($, on) => {
  const statuses: (string | undefined)[] = [];
  const argvs: (readonly string[])[] = [];
  world(on, statuses, argvs, () => LINE);

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });

  expect(argvs.length).toBe(1);
  expect(argvs[0]?.[0]).toBe('node');
  expect(argvs[0]?.[1]).toMatch(/\/statusline\/statusline\.mjs$/);
  expect(statuses).toEqual(['daily.dev · Why the best programmers are switching to Linux ▲13']);
});

test('the poll re-runs the script every 10s', async ($, on) => {
  const statuses: (string | undefined)[] = [];
  const argvs: (readonly string[])[] = [];
  const clock = world(on, statuses, argvs, () => LINE);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });
  await clock.advance(10_000);
  await clock.advance(10_000);
  expect(argvs.length).toBe(3);
});

test('the band shows the headline with an Open link and a Hide button on every surface', async ($, on) => {
  world(on, [], [], () => LINE);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'daily.dev', surface, component: 'AbovePrompt', props: PROPS });
    expect(await ui.find({ type: 'Text', text: /switching to Linux/ })).toBeDefined();
    const link = await ui.find({ type: 'Link' });
    expect(link?.props.href).toMatch(/^https:\/\/api\.daily\.dev\/c\/D8LNYgDuu/);
    expect(await ui.find({ type: 'Button', text: 'Hide' })).toBeDefined();
    await ui.unmount();
  }
});

test('the band yields to a survey', async ($, on) => {
  world(on, [], [], () => LINE);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });
  const ui = await $.ui.mount({ plugin: 'daily.dev', surface: 'terminal', component: 'AbovePrompt', props: { ...PROPS, hasSurvey: true } });
  expect(await ui.find({ type: 'Link' })).toBeUndefined();
  expect((await ui.drawn()) as any).toMatchObject({ type: 'engine' });
  await ui.unmount();
});

test('the band draws nothing while the script is still fetching', async ($, on) => {
  const statuses: (string | undefined)[] = [];
  world(on, statuses, [], () => FETCHING);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });
  expect(statuses).toEqual([undefined]);
  const ui = await $.ui.mount({ plugin: 'daily.dev', surface: 'terminal', component: 'AbovePrompt', props: PROPS });
  expect(await ui.find({ type: 'Link' })).toBeUndefined();
  await ui.unmount();
});

test('a failing node call clears the status and never throws', async ($, on) => {
  const statuses: (string | undefined)[] = [];
  on('session.start', (_$, e) => ({ cwd: e.cwd }));
  on('ui.status', (_$, e) => { statuses.push(e.text); return { value: undefined }; });
  on('process.run', () => { throw new Error('spawn node ENOENT'); });
  mock.clock(on);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });
  expect(statuses).toEqual([undefined]);
});

test('pressing Hide dismisses the band for the session', async ($, on) => {
  world(on, [], [], () => LINE);
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true });
  const ui = await $.ui.mount({ plugin: 'daily.dev', surface: 'terminal', component: 'AbovePrompt', props: PROPS });
  expect(await ui.find({ type: 'Button', key: 'Hide' })).toBeDefined();
  await ui.press({ key: 'Hide' });
  expect(await ui.find({ type: 'Link' })).toBeUndefined();
  expect((await ui.drawn()) as any).toMatchObject({ type: 'engine' });
  await ui.unmount();
});
