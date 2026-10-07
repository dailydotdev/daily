import { describe, expect, mock, test } from 'claude-code/testing';
import type { On } from 'claude-code';
import { fit, parseInstalls, postUrl, searchTerm } from '../hooks/feed';

const FEED = {
  data: {
    headlines: {
      edges: [
        { node: { headline: 'Kubernetes deprecates cgroup v1', channel: 'backend', significance: 'major', post: { id: 'k8s', numUpvotes: 12, numComments: 3 } } },
        { node: { headline: 'Zero-day in a popular TLS library', channel: 'security', significance: 'breaking', post: { id: 'tls', numUpvotes: 40, numComments: 9 } } },
      ],
    },
    popular: {
      edges: [{ node: { id: 'grpc', title: 'gRPC vs REST Is the Wrong Question', numUpvotes: 109, numComments: 4, tags: ['grpc', 'backend'] } }],
    },
  },
};

const SEARCH = {
  data: {
    searchPosts: {
      edges: [
        { node: { id: 'zod4', title: 'Introducing Zod 4', numUpvotes: 250, numComments: 20, createdAt: new Date(Date.now() - 864e5).toISOString(), tags: ['typescript'] } },
        { node: { id: 'meh', title: 'Something unrelated', numUpvotes: 900, numComments: 1, createdAt: new Date().toISOString() } },
      ],
    },
  },
};

describe('parseInstalls', () => {
  test('finds packages across managers', async () => {
    expect(parseInstalls('npm install zod @tanstack/react-query@^5 -D')).toEqual(['zod', '@tanstack/react-query']);
    expect(parseInstalls('cd web && pnpm add -D vitest')).toEqual(['vitest']);
    expect(parseInstalls('pip install "fastapi[all]>=0.110" uvicorn')).toEqual(['fastapi', 'uvicorn']);
    expect(parseInstalls('cargo add tokio --features full')).toEqual(['tokio']);
    expect(parseInstalls('go get github.com/spf13/cobra@latest')).toEqual(['github.com/spf13/cobra']);
    expect(parseInstalls('uv add httpx')).toEqual(['httpx']);
  });
  test('ignores installs that name no package', async () => {
    expect(parseInstalls('npm install')).toEqual([]);
    expect(parseInstalls('pip install -r requirements.txt')).toEqual([]);
    expect(parseInstalls('npm i ./local-pkg @types/node')).toEqual([]);
    expect(parseInstalls('git commit -m "npm install zod"')).toEqual([]);
  });
  test('search terms and links', async () => {
    expect(searchTerm('@tanstack/react-query')).toBe('react-query');
    expect(searchTerm('github.com/foo/bar/v2')).toBe('bar');
    expect(postUrl('abc', 'band')).toBe('https://api.daily.dev/c/abc?utm_source=claude-code&utm_medium=mod&utm_content=band');
    expect(fit('a very long headline indeed', 10)).toBe('a very lo…');
  });
});

describe('the mod', () => {
  const setup = async (on: On, toasts: string[] = []) => {
    mock.store(on);
    mock.env(on, { DAILY_DEV_TELEMETRY: '0' });
    const clock = mock.clock(on, { now: Date.parse('2026-10-07T10:00:00Z') });
    on('http.fetch', async ($: unknown, e: { url: string; init?: { body?: string } }) => {
      const body = e.init?.body ?? '';
      const json = body.includes('searchPosts') ? SEARCH : FEED;
      return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify(json) } };
    });
    // what the engine itself would answer beneath the plugin
    on('session.start', async (_$, e) => ({ cwd: e.cwd }));
    on('command.register', async (_$, e) => ({ value: { command: e.name } }));
    on('settings.read', async () => ({ value: {} }));
    on('ui.status', async () => ({ value: undefined }));
    on('ui.invalidate', async () => ({ value: undefined }));
    on('ui.toast', async (_$, e) => {
      toasts.push(e.text);
      return { value: undefined };
    });
    on('ui.render', async ($, e) => {
      const { Box } = $.ui.resolve(e);
      return <Box key="engine" />; // the engine's own drawing, beneath the mod
    });
    return clock;
  };

  test('the band shows a headline, breaking news first, on terminal and desktop', async ($, on) => {
    const clock = await setup(on);
    await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true });
    await clock.settle();
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'daily.dev',
        surface,
        component: 'AbovePrompt',
        props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} } as never,
      });
      expect((await ui.find({ type: 'Link' }))?.props.label).toMatch(/Zero-day/);
      expect(await ui.find({ type: 'Text', text: /BREAKING/ })).toBeDefined();
      if (surface === 'desktop') {
        // ✕ hides the band for the rest of the session; the engine draws its own
        await ui.press({ key: 'hide' });
        await ui.redraw();
        expect(await ui.find({ type: 'Link' })).toBeUndefined();
        expect(await ui.find({ key: 'engine' })).toBeDefined();
      }
      await ui.unmount();
    }
  });

  test('/daily opens a pane with headlines and most upvoted', async ($, on) => {
    const clock = await setup(on);
    await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true });
    await clock.settle();
    const ui = await $.ui.mount({
      plugin: 'daily.dev',
      surface: 'terminal',
      component: 'Pane',
      requestId: 'daily',
      props: { title: 'daily.dev', isFocused: true, bodyColumns: 100, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} } as never,
    });
    expect(await ui.find({ type: 'Text', text: /Headlines/ })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /Most upvoted/ })).toBeDefined();
    expect((await ui.findAll({ type: 'Link' })).length).toBe(3);
    await ui.unmount();
  });

  test('a successful install brings a ✨ toast, once', async ($, on) => {
    const toasts: string[] = [];
    const clock = await setup(on, toasts);
    on('tool.call', { tool: 'Bash' } as never, async () => ({ result: { stdout: 'added 1 package', stderr: '', interrupted: false } }) as never);
    await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true });
    await clock.settle();
    toasts.length = 0; // the first-run welcome
    await $.tool.call({ tool: 'Bash', tool_use_id: 't1', command: 'npm i zod' } as never);
    await clock.settle();
    await $.tool.call({ tool: 'Bash', tool_use_id: 't2', command: 'npm i zod' } as never);
    await clock.settle();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatch(/zod: Introducing Zod 4/);
  });
});
