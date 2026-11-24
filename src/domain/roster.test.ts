import { describe, expect, it } from 'vitest'
import { emptyReason, visibleUnits } from './roster'
import type { Abnormality, Entry, RosterQuery } from './types'

const unit = (code: string, name: string, risk: Abnormality['risk'], num: number, tool = false): Abnormality => ({
  code,
  name,
  risk,
  portrait: 0,
  portraitPath: '',
  letter: 'O',
  form: 'humanoid',
  num,
  tool,
})

const roster = [
  unit('O-01-45', 'Plague Doctor', 0, 45),
  unit('O-02-56', 'Punishing Bird', 1, 56),
  unit('T-09-09', 'Theresia', 1, 9, true),
  unit('O-02-40', 'Big Bird', 3, 40),
]
const entries: Record<string, Entry> = { 'O-02-56': { logged: '2026-11-24' } }
const all: RosterQuery = { q: '', filter: 'all', loggedOnly: false }
const codes = (shield: boolean, query: Partial<RosterQuery> = {}) =>
  visibleUnits(roster, entries, shield, { ...all, ...query }).map((u) => u.abnormality.code)

describe('visibleUnits', () => {
  it('puts logged units first, then unlogged ones by code number under the shield', () => {
    expect(codes(true)).toEqual(['O-02-56', 'T-09-09', 'O-02-40', 'O-01-45'])
  })

  it('sorts unlogged units by risk, then name, without the shield', () => {
    expect(codes(false)).toEqual(['O-02-56', 'O-01-45', 'T-09-09', 'O-02-40'])
  })

  it('finds a sealed unit by code, and by name only from three letters on', () => {
    expect(codes(true, { q: 'o-01' })).toEqual(['O-01-45'])
    expect(codes(true, { q: 'pl' })).toEqual([])
    const [peeked] = visibleUnits(roster, entries, true, { ...all, q: 'pla' })
    expect(peeked).toMatchObject({ sealed: true, peek: true })
  })

  it('hides sealed units from a risk filter, since their risk is a secret', () => {
    expect(codes(true, { filter: '1' })).toEqual(['O-02-56'])
    expect(codes(false, { filter: '1' })).toEqual(['O-02-56', 'T-09-09'])
  })

  it('filters tools and logged-only', () => {
    expect(codes(true, { filter: 'tools' })).toEqual(['T-09-09'])
    expect(codes(true, { loggedOnly: true })).toEqual(['O-02-56'])
  })
})

describe('emptyReason', () => {
  it('prefers the search, then the risk filter, then logged-only', () => {
    expect(emptyReason({ q: 'x', filter: '2', loggedOnly: true })).toBe('search')
    expect(emptyReason({ q: ' ', filter: '2', loggedOnly: true })).toBe('risk')
    expect(emptyReason({ q: '', filter: 'tools', loggedOnly: true })).toBe('logged')
    expect(emptyReason({ q: '', filter: 'tools', loggedOnly: false })).toBe('filters')
  })
})
