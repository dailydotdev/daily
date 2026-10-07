import { describe, expect, test } from 'claude-code/testing'

import { DAY_MS, fit, parseLine, pickBatch, tagUrl } from './headlines'

const LINE =
  '\x1b[38;5;135mdaily.dev\x1b[0m \x1b]8;;https://api.daily.dev/c/3GqfG5xk2?utm_source=claude-code&utm_medium=statusline\x1b\\\x1b[1m12 things I miss since coding died\x1b[0m\x1b]8;;\x1b\\ \x1b[2m▲70\x1b[0m'

describe('headlines', () => {
  test('parses a server-rendered statusline line', async () => {
    expect(parseLine(LINE)).toEqual({
      postId: '3GqfG5xk2',
      title: '12 things I miss since coding died',
      url: 'https://api.daily.dev/c/3GqfG5xk2?utm_source=claude-code&utm_medium=statusline',
      upvotes: 70,
    })
  })

  test('tags /c/ links with the mod medium and anonymous id', async () => {
    const url = tagUrl('https://api.daily.dev/c/abc?utm_source=claude-code&utm_medium=statusline', 'mod-band', 'u1')
    expect(url).toBe('https://api.daily.dev/c/abc?utm_source=claude-code&utm_medium=mod-band&cc_uid=u1')
  })

  test('skips posts shown in the last day, recycling the oldest when short', async () => {
    const all = ['a', 'b', 'c'].map((id) => ({ postId: id, title: id, url: null, upvotes: null }))
    const now = DAY_MS * 10
    const batch = pickBatch(all, { a: now - 1000, b: now - 5000 }, now, 20, 2)
    expect(batch.map((h) => h.postId)).toEqual(['c', 'b'])
  })

  test('fits titles to the band width', async () => {
    expect(fit('abcdef', 4)).toBe('abc…')
    expect(fit('abc', 4)).toBe('abc')
  })
})
