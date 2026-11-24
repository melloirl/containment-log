import { describe, expect, it } from 'vitest'
import { blankEntry, blankState, normalize } from './log-state'

const now = () => 42

describe('blankState and blankEntry', () => {
  it('write keys in the legacy order', () => {
    expect(JSON.stringify(blankState())).toBe('{"v":1,"shield":true,"entries":{}}')
    expect(JSON.stringify(blankEntry(7))).toBe(
      '{"met":7,"a":{"u":0,"d":0,"m":0},"fan":false,"w":{},"lost":0,"note":"","scraps":[]}',
    )
  })
})

describe('normalize', () => {
  it('returns a blank state for junk', () => {
    for (const junk of [undefined, null, 0, 'x', true, 12]) {
      expect(normalize(junk)).toEqual(blankState())
    }
    expect(normalize({})).toEqual(blankState())
    expect(normalize({ entries: 'nope' })).toEqual(blankState())
    expect(normalize({ entries: null })).toEqual(blankState())
  })

  it('keeps the shield on unless it is exactly false', () => {
    expect(normalize({ shield: false }).shield).toBe(false)
    expect(normalize({ shield: 0 }).shield).toBe(true)
    expect(normalize({ shield: 'false' }).shield).toBe(true)
  })

  it('drops unknown codes, entries that are not objects and entries without met', () => {
    const s = normalize({
      entries: {
        'X-01-01': { met: 1 },
        constructor: { met: 1 },
        'o-03-03': { met: 1 },
        'O-03-03': { met: 0 },
        'F-04-83': 'yes',
        'F-05-52': {},
        'O-01-45': { met: 5 },
      },
    })
    expect(Object.keys(s.entries)).toEqual(['O-01-45'])
  })

  it('clamps numbers the way parseInt does', () => {
    const s = normalize({
      entries: {
        'O-01-45': { met: 'abc', a: { u: 9, d: '3.9', m: -2 }, lost: 12000 },
        'O-03-03': { met: '17', a: { u: 'x', d: true, m: [2] }, lost: '-3' },
        'F-04-83': { met: 1, lost: 4.8 },
      },
    }, now)
    expect(s.entries['O-01-45']).toMatchObject({ met: 42, a: { u: 3, d: 3, m: 0 }, lost: 9999 })
    expect(s.entries['O-03-03']).toMatchObject({ met: 17, a: { u: 0, d: 0, m: 2 }, lost: 0 })
    expect(s.entries['F-04-83']!.lost).toBe(4)
  })

  it('keeps only 1 and -1 work results, and non-string notes become empty', () => {
    const s = normalize({
      entries: {
        'O-01-45': {
          met: 1,
          w: { repression: -1, instinct: 1, insight: 0, attachment: '1', bogus: 1 },
          note: 3,
          fan: 'yes',
        },
      },
    })
    const e = s.entries['O-01-45']!
    expect(e.w).toEqual({ instinct: 1, repression: -1 })
    expect(Object.keys(e.w)).toEqual(['instinct', 'repression'])
    expect(e.note).toBe('')
    expect(e.fan).toBe(true)
  })

  it('carries r through untouched', () => {
    const r = { old: [1, 2], x: 'y' }
    const s = normalize({ entries: { 'O-01-45': { met: 1, r }, 'O-03-03': { met: 1, r: 'str' } } })
    expect(s.entries['O-01-45']!.r).toBe(r)
    expect('r' in s.entries['O-03-03']!).toBe(false)
  })

  it('filters scraps and trims long text', () => {
    const s = normalize({
      entries: {
        'O-01-45': {
          met: 1,
          scraps: [{ t: 5, x: 'a' }, { x: '   ' }, null, { t: 'q', x: 'y'.repeat(4100) }, { x: 3 }, 'str'],
        },
        'O-03-03': { met: 1, scraps: 'nope' },
      },
    }, now)
    expect(s.entries['O-01-45']!.scraps).toEqual([
      { t: 5, x: 'a' },
      { t: 42, x: 'y'.repeat(4000) },
    ])
    expect(s.entries['O-03-03']!.scraps).toEqual([])
  })

  it('writes keys in the legacy order whatever order they came in', () => {
    const s = normalize({
      entries: {
        'O-01-45': {
          r: { a: 1 },
          scraps: [{ x: 'n', t: 3 }],
          note: 'hi',
          lost: 2,
          w: { insight: -1, instinct: 1 },
          fan: true,
          a: { m: 1, d: 2, u: 3 },
          met: 10,
          extra: 'dropped',
        },
      },
      shield: false,
      v: 7,
      junk: 1,
    })
    expect(JSON.stringify(s)).toBe(
      '{"v":1,"shield":false,"entries":{"O-01-45":{"met":10,"a":{"u":3,"d":2,"m":1},"fan":true,' +
        '"w":{"instinct":1,"insight":-1},"lost":2,"note":"hi","scraps":[{"t":3,"x":"n"}],"r":{"a":1}}}}',
    )
  })

  it('keeps entry order', () => {
    const s = normalize({ entries: { 'T-03-46': { met: 1 }, 'O-03-03': { met: 1 }, 'F-04-83': { met: 1 } } })
    expect(Object.keys(s.entries)).toEqual(['T-03-46', 'O-03-03', 'F-04-83'])
  })
})
