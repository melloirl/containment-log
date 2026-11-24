import { describe, expect, it } from 'vitest'
import { normalizeEntry, patchEntry, toFiles, today } from './normalize'

describe('normalizeEntry', () => {
  it('writes keys in a fixed order and drops what is not set', () => {
    const entry = normalizeEntry({
      agentsLost: 0,
      works: { repression: 'bad', instinct: 'good' },
      fan: false,
      rating: { management: 'none', usefulness: 'useful' },
      logged: '2026-11-24',
    })
    expect(JSON.stringify(entry)).toBe(
      '{"logged":"2026-11-24","rating":{"usefulness":"useful","management":"none"},"works":{"instinct":"good","repression":"bad"}}',
    )
  })

  it('leaves a bare entry bare', () => {
    expect(normalizeEntry({ logged: '2026-11-24', rating: {}, works: {} })).toEqual({ logged: '2026-11-24' })
  })
})

describe('patchEntry', () => {
  const entry = { logged: '2026-11-24', rating: { usefulness: 'useful', danger: 'peaceful' } } as const

  it('changes one axis and keeps the others', () => {
    expect(patchEntry(entry, { rating: { danger: 'extreme' } }).rating).toEqual({
      usefulness: 'useful',
      danger: 'extreme',
    })
  })

  it('clears an axis or a work result given undefined', () => {
    expect(patchEntry(entry, { rating: { danger: undefined } }).rating).toEqual({ usefulness: 'useful' })
    expect(patchEntry({ ...entry, works: { insight: 'good' } }, { works: { insight: undefined } }).works).toBeUndefined()
  })

  it('keeps the count of agents lost a whole number, zero or more', () => {
    expect(patchEntry(entry, { agentsLost: 2.7 }).agentsLost).toBe(2)
    expect(patchEntry(entry, { agentsLost: -1 }).agentsLost).toBeUndefined()
  })
})

describe('toFiles', () => {
  it('orders by the roster and keeps a note only with an entry and some text', () => {
    const files = toFiles(
      {
        entries: { B: { logged: '2026-11-24' }, A: { logged: '2026-11-23', fan: true } },
        notes: { A: '  First.\n\nSecond.\n', B: '   ', C: 'No entry.' },
      },
      ['A', 'B', 'C'],
    )
    expect(Object.keys(files.entries)).toEqual(['A', 'B'])
    expect(files.notes).toEqual({ A: 'First.\n\nSecond.' })
  })
})

describe('today', () => {
  it('is the local day', () => {
    expect(today(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
