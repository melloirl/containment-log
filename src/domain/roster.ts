import type { Abnormality, Entry, RosterFilter, RosterQuery, UnitView } from './types'

/** Searches shorter than this never reveal the name of a sealed unit. */
const PEEK_MIN = 3

/** A filter on one risk level, as opposed to 'all' or 'tools'. */
export function isRiskFilter(filter: RosterFilter): boolean {
  return filter !== 'all' && filter !== 'tools'
}

/**
 * The tiles to draw, in order: logged units first; then, under the spoiler
 * shield, unlogged units by code number; otherwise by risk, then name.
 *
 * A search matches the code, or the name of a unit whose name is showing. A
 * sealed unit's name counts once three or more letters are typed (a peek). A
 * risk filter hides sealed units, since their risk is a secret.
 */
export function visibleUnits(
  roster: readonly Abnormality[],
  entries: Readonly<Record<string, Entry>>,
  shield: boolean,
  query: RosterQuery,
): UnitView[] {
  const q = query.q.trim().toLowerCase()
  const out: UnitView[] = []
  for (const a of roster) {
    const met = !!entries[a.code]
    const sealed = !met && shield
    const codeHit = a.code.toLowerCase().indexOf(q) > -1
    const nameHit = a.name.toLowerCase().indexOf(q) > -1
    const peek = sealed && q.length >= PEEK_MIN && nameHit
    if (q && !(codeHit || (nameHit && (!sealed || peek)))) continue
    if (query.loggedOnly && !met) continue
    if (query.filter === 'tools') {
      if (!a.tool) continue
    } else if (query.filter !== 'all') {
      if (sealed || a.risk !== Number(query.filter)) continue
    }
    out.push({ abnormality: a, met, sealed, peek })
  }
  out.sort((x, y) => {
    if (x.met !== y.met) return x.met ? -1 : 1
    if (!x.met && shield) return x.abnormality.num - y.abnormality.num
    return (
      x.abnormality.risk - y.abnormality.risk ||
      x.abnormality.name.localeCompare(y.abnormality.name)
    )
  })
  return out
}

/** Why the grid is empty, as a key under `grid.empty`. A search wins over a risk filter, which wins over logged-only. */
export function emptyReason(query: RosterQuery): 'search' | 'risk' | 'logged' | 'filters' {
  if (query.q.trim()) return 'search'
  if (isRiskFilter(query.filter)) return 'risk'
  if (query.loggedOnly) return 'logged'
  return 'filters'
}
