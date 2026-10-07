// Pure helpers for the daily.dev headlines mod: no `$`, so tests can call them directly.
import type { Headline } from '../types'

const OSC8 = /\x1b\]8;;([^\x1b\x07]*)(?:\x1b\\|\x07)/g
const SGR = /\x1b\[[0-9;]*m/g

/** Turns one server-rendered statusline line (ANSI + OSC 8) into plain data. */
export function parseLine(line: string): Headline | null {
  let url: string | null = null
  for (const m of line.matchAll(OSC8)) {
    if (m[1]) {
      url = m[1]
      break
    }
  }
  const plain = line.replace(OSC8, '').replace(SGR, '').trim()
  const upMatch = plain.match(/\s▲(\d+)$/)
  const title = plain
    .replace(/^daily\.dev\s+/, '')
    .replace(/\s▲\d+$/, '')
    .trim()
  if (!title) return null
  const postId = url?.match(/\/c\/([^?\s/]+)/)?.[1] ?? null
  return { postId, title, url, upvotes: upMatch ? Number(upMatch[1]) : null }
}

/** Tags a /c/ link so clicks attribute to this surface and (optionally) this anonymous id. */
export function tagUrl(url: string | null, medium: string, userId?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.pathname.startsWith('/c/')) return url
    u.searchParams.set('utm_medium', medium)
    if (userId) u.searchParams.set('cc_uid', userId)
    return u.toString()
  } catch {
    return url
  }
}

export const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Picks the batch to rotate through: unseen-in-24h first, topped up with the
 * least recently shown so the line never goes blank.
 */
export function pickBatch(
  all: readonly Headline[],
  history: Readonly<Record<string, number>>,
  now: number,
  max = 20,
  min = 10,
): Headline[] {
  const seen = new Set<string>()
  const unique = all.filter((h) => {
    const k = h.postId ?? h.title
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  const recent = (h: Headline) =>
    h.postId !== null && history[h.postId] !== undefined && now - history[h.postId]! < DAY_MS
  let batch = unique.filter((h) => !recent(h)).slice(0, max)
  if (batch.length < min) {
    const recycled = unique
      .filter(recent)
      .sort((a, b) => history[a.postId!]! - history[b.postId!]!)
    batch = batch.concat(recycled.slice(0, min - batch.length))
  }
  return batch
}

export function pruneHistory(history: Record<string, number>, now: number): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [id, ts] of Object.entries(history)) if (now - ts < DAY_MS) out[id] = ts
  return out
}

/** Cuts a title to fit `cols` cells, with an ellipsis. */
export function fit(text: string, cols: number): string {
  if (cols <= 1) return ''
  return text.length <= cols ? text : `${text.slice(0, Math.max(0, cols - 1))}…`
}
