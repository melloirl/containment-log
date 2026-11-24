import { describe, expect, it } from 'vitest'
import { ABNORMALITIES, byCode } from './catalog'
import { blankEntry } from './log-state'
import { countLabel, emptyMessage, isRiskFilter, visibleUnits } from './roster'
import type { LogState, RosterQuery } from './types'

function stateWith(codes: string[], shield = true): LogState {
  return { v: 1, shield, entries: Object.fromEntries(codes.map((c) => [c, blankEntry(1)])) }
}
const query = (q: Partial<RosterQuery> = {}): RosterQuery => ({ q: '', filter: 'all', loggedOnly: false, ...q })
const codes = (state: LogState, q: Partial<RosterQuery>) => visibleUnits(state, query(q)).map((u) => u.abnormality.code)

describe('visibleUnits: search', () => {
  it('matches a sealed unit by code, without a peek', () => {
    const [unit] = visibleUnits(stateWith([]), query({ q: ' O-03-03 ' }))
    expect(unit).toMatchObject({ met: false, sealed: true, peek: false })
    expect(unit!.abnormality.code).toBe('O-03-03')
  })

  it('hides a sealed name match under three letters', () => {
    expect(codes(stateWith([]), { q: 'pl' })).not.toContain('O-01-45')
    expect(codes(stateWith([], false), { q: 'pl' })).toContain('O-01-45')
    expect(codes(stateWith(['O-01-45']), { q: 'pl' })).toContain('O-01-45')
  })

  it('peeks at a sealed name from three letters, case-insensitively', () => {
    const units = visibleUnits(stateWith([]), query({ q: 'PLA' }))
    const plague = units.find((u) => u.abnormality.code === 'O-01-45')
    expect(plague).toMatchObject({ sealed: true, peek: true })
  })

  it('never peeks at an unsealed unit', () => {
    const units = visibleUnits(stateWith([], false), query({ q: 'plague' }))
    expect(units).toHaveLength(1)
    expect(units[0]).toMatchObject({ sealed: false, peek: false })
  })
})

describe('visibleUnits: filters', () => {
  it('hides sealed units under a risk filter', () => {
    expect(codes(stateWith([]), { filter: '0' })).toEqual([])
    expect(codes(stateWith(['O-03-03', 'T-03-46']), { filter: '0' })).toEqual(['O-03-03'])
    expect(codes(stateWith([], false), { filter: '0' })).toHaveLength(
      ABNORMALITIES.filter((a) => a.risk === 0).length,
    )
  })

  it('shows every tool under the tools filter, sealed or not', () => {
    const tools = codes(stateWith([]), { filter: 'tools' })
    expect(new Set(tools)).toEqual(new Set(ABNORMALITIES.filter((a) => a.tool).map((a) => a.code)))
    expect(tools).toContain('Bald-Is-Awesome!')
    expect(tools).toContain('O-07-103')
    expect(tools).not.toContain('O-03-03')
  })

  it('shows only logged units when loggedOnly is on', () => {
    expect(codes(stateWith(['T-03-46', 'O-01-45']), { loggedOnly: true })).toEqual(['O-01-45', 'T-03-46'])
    expect(codes(stateWith([]), { loggedOnly: true })).toEqual([])
  })
})

describe('visibleUnits: sort', () => {
  it('puts logged units first, by risk then name', () => {
    const list = codes(stateWith(['T-03-46', 'O-02-63', 'O-03-03', 'F-04-83']), {})
    // ZAYIN: Fairy Festival < One Sin...; ALEPH: Apocalypse Bird < WhiteNight
    expect(list.slice(0, 4)).toEqual(['F-04-83', 'O-03-03', 'O-02-63', 'T-03-46'])
  })

  it('orders sealed units by code number, roster order on ties, non-standard last', () => {
    const list = visibleUnits(stateWith([]), query())
    const nums = list.map((u) => u.abnormality.num)
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
    expect(list.at(-1)!.abnormality.code).toBe('Bald-Is-Awesome!')
    expect(list[0]!.abnormality.code).toBe('O-00-00')
    const threes = list.filter((u) => u.abnormality.num === 3).map((u) => u.abnormality.code)
    expect(threes).toEqual(ABNORMALITIES.filter((a) => a.num === 3).map((a) => a.code))
  })

  it('orders unlogged units by risk then name when the shield is off', () => {
    const list = visibleUnits(stateWith(['T-03-46'], false), query())
    expect(list[0]!.abnormality.code).toBe('T-03-46')
    const rest = list.slice(1).map((u) => u.abnormality)
    const sorted = [...rest].sort((a, b) => a.risk - b.risk || a.name.localeCompare(b.name))
    expect(rest).toEqual(sorted)
    expect(rest[0]!.code).toBe(byCode('D-01-106')!.code) // Army in Black
  })
})

describe('emptyMessage', () => {
  const SEARCH =
    'Nothing matches that search. Try the classification code shown on the containment unit, like O-03-03.'
  it('prefers search, then risk filter, then logged-only', () => {
    expect(emptyMessage(query({ q: 'x', filter: '2', loggedOnly: true }))).toBe(SEARCH)
    expect(emptyMessage(query({ q: '  ', filter: '2', loggedOnly: true }))).toBe(
      'Nothing logged at this risk level yet.',
    )
    expect(emptyMessage(query({ filter: 'tools', loggedOnly: true }))).toBe(
      'Your log is empty. Open any unit and log your first encounter.',
    )
    expect(emptyMessage(query({ filter: 'tools' }))).toBe('Nothing to show with these filters.')
    expect(emptyMessage(query())).toBe('Nothing to show with these filters.')
  })
})

describe('isRiskFilter and countLabel', () => {
  it('tells risk filters apart', () => {
    expect(isRiskFilter('all')).toBe(false)
    expect(isRiskFilter('tools')).toBe(false)
    expect(isRiskFilter('0')).toBe(true)
    expect(isRiskFilter('4')).toBe(true)
  })
  it('pluralises', () => {
    expect(countLabel(0)).toBe('0 units shown')
    expect(countLabel(1)).toBe('1 unit shown')
    expect(countLabel(85)).toBe('85 units shown')
  })
})
