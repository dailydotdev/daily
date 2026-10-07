// daily.dev headlines mod for Claude Code.
//
// Rotating daily.dev headlines with zero setup: a clickable band above the
// prompt (default) and/or a plain status line entry. Same server feed
// (`statuslineHeadlines`) and analytics contract as statusline/statusline.mjs,
// which stays for Claude Code builds without mods.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Headline } from '../types'
import { fit, parseLine, pickBatch, pruneHistory, tagUrl } from './headlines'

const ORIGIN = 'https://api.daily.dev'
const VERSION = '0.7.0' // keep in step with plugin.json
const ROTATE_MS = 60 * 1000
const REFRESH_MS = 20 * 60 * 1000
const IMPRESSION_DEDUP_MS = 30 * 60 * 1000
const HIDE_MS = 24 * 60 * 60 * 1000
const PURPLE = '#af5fff'
const QUERY = 'query ClaudeCodeStatusline($first: Int) { statuslineHeadlines(first: $first) }'

const current = atom({ plugin: 'daily.dev', key: 'current' } as const, null)
const isHidden = atom({ plugin: 'daily.dev', key: 'isHidden' } as const, false)

type Identity = { userId: string; deviceId: string }

// Module-local cache: rebuilt after a reload, which is fine.
const ctx = {
  showBand: true,
  showStatus: false,
  telemetry: true,
  batch: [] as Headline[],
  index: -1,
  fetchedAt: 0,
  identity: undefined as Identity | undefined,
  visitId: crypto.randomUUID(),
  sessionId: crypto.randomUUID(),
}

async function ensureIdentity($: EngineInterface): Promise<Identity | undefined> {
  if (!ctx.telemetry) return undefined
  if (ctx.identity) return ctx.identity
  const stored = (await $.store.get('identity')) as Identity | undefined
  if (stored?.userId) return (ctx.identity = stored)
  let userId: string | undefined
  try {
    const res = await $.http.fetch(`${ORIGIN}/boot?v=claude-code-mod-${VERSION}`, {
      headers: { app: 'claude-code' },
    })
    userId = (JSON.parse(res.text) as { user?: { id?: string } })?.user?.id
  } catch {
    // offline: fall back to a local id
  }
  const id: Identity = { userId: userId ?? crypto.randomUUID(), deviceId: crypto.randomUUID() }
  ctx.identity = id
  await $.store.set('identity', id)
  return id
}

async function refresh($: EngineInterface): Promise<void> {
  const now = await $.clock.now()
  const history = pruneHistory(
    ((await $.store.get('history')) as Record<string, number> | undefined) ?? {},
    now,
  )
  let lines: string[] = []
  try {
    const res = await $.http.fetch(`${ORIGIN}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { first: 40 } }),
    })
    if (res.ok) {
      lines =
        (JSON.parse(res.text) as { data?: { statuslineHeadlines?: string[] } })?.data
          ?.statuslineHeadlines ?? []
    }
  } catch {
    // keep the previous batch
  }
  const parsed = lines.map(parseLine).filter((h): h is Headline => h !== null)
  const fresh = pickBatch(parsed, history, now)
  if (fresh.length) {
    ctx.batch = fresh
    ctx.index = -1
  }
  ctx.fetchedAt = now
  await $.store.set('history', history)
}

async function logImpression($: EngineInterface, h: Headline, origin: string): Promise<void> {
  if (!ctx.telemetry || !h.postId) return
  const id = await ensureIdentity($)
  if (!id) return
  const now = await $.clock.now()
  const logged = ((await $.store.get('impressions')) as Record<string, number> | undefined) ?? {}
  const last = logged[h.postId]
  if (last !== undefined && now - last < IMPRESSION_DEDUP_MS) return
  for (const [k, ts] of Object.entries(logged)) if (now - ts > 2 * IMPRESSION_DEDUP_MS) delete logged[k]
  logged[h.postId] = now
  await $.store.set('impressions', logged)
  try {
    await $.http.fetch(`${ORIGIN}/e`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            event_id: `${Math.floor(now / 1000)}${Math.random().toString(36).slice(2, 8)}`,
            event_name: 'impression',
            event_timestamp: new Date(now).toISOString(),
            visit_id: ctx.visitId,
            session_id: ctx.sessionId,
            user_id: id.userId,
            device_id: id.deviceId,
            app_platform: 'claude-code',
            app_version: VERSION,
            target_type: 'post',
            target_id: h.postId,
            feed_item_title: h.title,
            extra: JSON.stringify({ origin }),
          },
        ],
      }),
    })
  } catch {
    // analytics must never break the headline
  }
}

async function rotate($: EngineInterface): Promise<void> {
  if (!ctx.batch.length || (await $.clock.now()) - ctx.fetchedAt > REFRESH_MS) await refresh($)
  if (!ctx.batch.length) return
  ctx.index = (ctx.index + 1) % ctx.batch.length
  const h = ctx.batch[ctx.index]!
  if (h.postId) {
    const history = ((await $.store.get('history')) as Record<string, number> | undefined) ?? {}
    history[h.postId] = await $.clock.now()
    await $.store.set('history', history)
  }
  await update($, current, () => h)
  if (ctx.showStatus) {
    $.ui.status(`daily.dev · ${h.title}${h.upvotes ? ` ▲${h.upvotes}` : ''}`)
    await logImpression($, h, 'claude code mod status')
  }
  if (ctx.showBand && !(await read($, isHidden))) await logImpression($, h, 'claude code mod band')
}

async function hideForToday($: EngineInterface): Promise<void> {
  await $.store.set('hiddenUntil', (await $.clock.now()) + HIDE_MS)
  await update($, isHidden, () => true)
}

export const register: Register = (on, options) => {
  const display = options.display === 'status' || options.display === 'both' ? options.display : 'band'
  ctx.showBand = display !== 'status'
  ctx.showStatus = display !== 'band'

  on('session.start', async ($, e, next) => {
    const flag = await $.env.get('DAILY_DEV_TELEMETRY')
    ctx.telemetry = !['0', 'false'].includes(flag ?? '')
    const hiddenUntil = Number((await $.store.get('hiddenUntil')) ?? 0)
    if (hiddenUntil > (await $.clock.now())) await update($, isHidden, () => true)
    await ensureIdentity($).catch(() => undefined)
    await rotate($).catch(() => undefined)
    $.clock.every(ROTATE_MS, () => {
      void rotate($).catch(() => undefined)
    })
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!ctx.showBand || e.props.hasSurvey) return next(e)
    const item = await read($, current)
    if (!item || (await read($, isHidden))) return next(e)

    const { Box, Text, Link, Button } = $.ui.resolve(e)
    const href = tagUrl(item.url, 'mod-band', ctx.telemetry ? ctx.identity?.userId : undefined)
    const up = item.upvotes ? `▲${item.upvotes}` : ''
    // "daily.dev " + title + " ▲n" + " Next  Hide today"
    const room = e.props.bodyColumns - 10 - (up ? up.length + 1 : 0) - 18
    const title = fit(item.title, Math.max(12, room))

    return (
      <Box flexDirection="row" gap={1}>
        <Text color={PURPLE} bold>
          daily.dev
        </Text>
        {href ? <Link href={href} label={title} /> : <Text>{title}</Text>}
        {up ? <Text dimColor>{up}</Text> : null}
        <Button key="next" label="Next" plain dimColor onPress={() => rotate($)} />
        <Button key="hide" label="Hide today" plain dimColor onPress={() => hideForToday($)} />
      </Box>
    )
  })
}
