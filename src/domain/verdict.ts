import { VERDICTS } from './catalog'
import type { EntryView, Verdict } from './types'

/**
 * Score out of 10, rounded to one decimal, and the tier it earns.
 * Usefulness is half the score; the less danger and management, the more of the other half it keeps.
 * Null until all three axes are rated.
 */
export function verdict(entry: EntryView): Verdict | null {
  const { u, d, m } = entry.a
  if (!(u && d && m)) return null
  const score =
    Math.round(100 * ((0.5 * (u - 1)) / 2 + 0.3 * (1 - (d - 1) / 4) + 0.2 * (1 - (m - 1) / 3))) / 10
  const tier = VERDICTS.find((t) => score >= t.min) ?? VERDICTS[VERDICTS.length - 1]!
  return { score, call: tier.call, why: tier.why }
}
