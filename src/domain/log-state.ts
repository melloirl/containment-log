import { AXES, WORKS, byCode } from './catalog'
import type { Entry, LogState, Scrap } from './types'

/** Longest scrap text kept by normalize. */
const SCRAP_MAX = 4000
/** Highest agents-lost count accepted from stored text. */
const LOST_MAX = 9999

export function blankState(): LogState {
  return { v: 1, shield: true, entries: {} }
}

/** A freshly logged entry. Key order is part of the stored text. */
export function blankEntry(now: number): Entry {
  return { met: now, a: { u: 0, d: 0, m: 0 }, fan: false, w: {}, lost: 0, note: '', scraps: [] }
}

/** parseInt, with NaN read as `lo`, then clamped to [lo, hi]. */
function clampInt(value: unknown, lo: number, hi: number): number {
  let n = parseInt(String(value), 10)
  if (isNaN(n)) n = lo
  return Math.max(lo, Math.min(hi, n))
}

type Loose = Record<string, unknown>

function isObject(value: unknown): value is Loose {
  return !!value && typeof value === 'object'
}

/**
 * The schema v1 gatekeeper: turns anything read from storage or pasted as a
 * backup into a valid LogState. Unknown codes and entries without `met` are
 * dropped, numbers are clamped, empty scraps are filtered out, and legacy `r`
 * ratings are carried through untouched.
 *
 * `now` stamps entries and scraps whose timestamp is missing or not a number.
 */
export function normalize(raw: unknown, now: () => number = Date.now): LogState {
  const state = blankState()
  if (!isObject(raw)) return state
  state.shield = raw.shield !== false
  const entries: Loose = isObject(raw.entries) ? raw.entries : {}
  for (const code of Object.keys(entries)) {
    const e = entries[code]
    if (!byCode(code) || !isObject(e) || !e.met) continue
    const a = (e.a || {}) as Loose
    const w = (e.w || {}) as Loose
    const out: Entry = {
      met: Number(e.met) || now(),
      a: { u: 0, d: 0, m: 0 },
      fan: !!e.fan,
      w: {},
      lost: clampInt(e.lost, 0, LOST_MAX),
      note: typeof e.note === 'string' ? e.note : '',
      scraps: [],
    }
    for (const axis of AXES) out.a[axis.key] = clampInt(a[axis.key], 0, axis.levels.length)
    if (isObject(e.r)) out.r = e.r
    for (const work of WORKS) {
      const result = w[work.key]
      if (result === 1 || result === -1) out.w[work.key] = result
    }
    if (Array.isArray(e.scraps)) {
      for (const sc of e.scraps as unknown[]) {
        if (isObject(sc) && typeof sc.x === 'string' && sc.x.trim()) {
          const scrap: Scrap = { t: Number(sc.t) || now(), x: sc.x.slice(0, SCRAP_MAX) }
          out.scraps.push(scrap)
        }
      }
    }
    state.entries[code] = out
  }
  return state
}
