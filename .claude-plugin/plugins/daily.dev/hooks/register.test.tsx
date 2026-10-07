import { expect, mock, test } from 'claude-code/testing'

const LINES = [
  '\x1b[38;5;135mdaily.dev\x1b[0m \x1b]8;;https://api.daily.dev/c/post1?utm_source=claude-code&utm_medium=statusline\x1b\\\x1b[1mFirst headline\x1b[0m\x1b]8;;\x1b\\ \x1b[2m▲70\x1b[0m',
  '\x1b[38;5;135mdaily.dev\x1b[0m \x1b]8;;https://api.daily.dev/c/post2?utm_source=claude-code&utm_medium=statusline\x1b\\\x1b[1mSecond headline\x1b[0m\x1b]8;;\x1b\\',
]

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 9, top: 0 } },
} as const

test('band shows a clickable headline, rotates on Next and hides for the day', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  mock.env(on, {})
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  // stands in for the engine drawing an empty band
  on('ui.render', async ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box key="engine" />
  })
  const events: string[] = []
  on('http.fetch', async (_$, e) => {
    if (e.url.endsWith('/graphql')) {
      return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ data: { statuslineHeadlines: LINES } }) } }
    }
    if (e.url.includes('/boot')) {
      return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ user: { id: 'anon-1' } }) } }
    }
    if (e.url.endsWith('/e')) events.push(e.init?.body ?? '')
    return { value: { status: 200, ok: true, headers: {}, text: '{}' } }
  })

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'daily.dev', surface, ...BAND } as never)
    const link = await (ui as any).find({ type: 'Link' })
    expect(link?.props?.href ?? link?.href).toContain('/c/post1')
    expect(String(link?.props?.href ?? link?.href)).toContain('utm_medium=mod-band')
    expect(String(link?.props?.href ?? link?.href)).toContain('cc_uid=anon-1')
    await (ui as any).unmount()
  }
  expect(events.length).toBe(1)
  expect(events[0]).toContain('claude code mod band')

  const ui = await $.ui.mount({ plugin: 'daily.dev', surface: 'terminal', ...BAND } as never)
  await (ui as any).press({ key: 'next' })
  const second = await (ui as any).find({ type: 'Link' })
  expect(JSON.stringify(second)).toContain('/c/post2')

  await (ui as any).press({ key: 'hide' })
  expect(await (ui as any).find({ type: 'Link' })).toBeUndefined()
  expect(await (ui as any).find({ key: 'engine' })).toBeDefined()
})

test('telemetry off sends no impressions', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  mock.env(on, { DAILY_DEV_TELEMETRY: '0' })
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  const urls: string[] = []
  on('http.fetch', async (_$, e) => {
    urls.push(e.url)
    return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ data: { statuslineHeadlines: LINES } }) } }
  })
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  expect(urls.some((u) => u.endsWith('/e') || u.includes('/boot'))).toBe(false)
})

test('status display pins the headline and leaves the band to the engine', { options: { display: 'status' } }, async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  mock.env(on, { DAILY_DEV_TELEMETRY: '0' })
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('ui.render', async ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box key="engine" />
  })
  const statuses: (string | undefined)[] = []
  on('ui.status', async (_$, e) => {
    statuses.push((e as { text?: string }).text)
    return { value: undefined } as never
  })
  on('http.fetch', async () => ({
    value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ data: { statuslineHeadlines: LINES } }) },
  }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  expect(statuses[0]).toBe('daily.dev · First headline ▲70')
  const ui = await $.ui.mount({ plugin: 'daily.dev', surface: 'terminal', ...BAND } as never)
  expect(await (ui as any).find({ type: 'Link' })).toBeUndefined()
})
