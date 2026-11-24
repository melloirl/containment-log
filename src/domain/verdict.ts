import { AXES, VERDICTS } from './catalog'
import type { AxisKey, Entry, Verdict } from './types'

/** 0 when the axis is not rated, else the 1-based position of its level. */
export function levelOf(entry: Entry, axis: AxisKey): number {
  const level = entry.rating?.[axis]
  const levels = AXES.find((x) => x.key === axis)!.levels
  return level ? levels.indexOf(level) + 1 : 0
}

/**
 * Score out of 10, rounded to one decimal, and the tier it earns.
 * Usefulness is half the score; the less danger and management, the more of the other half it keeps.
 * Null until all three axes are rated.
 */
export function verdict(entry: Entry): Verdict | null {
  const u = levelOf(entry, 'usefulness')
  const d = levelOf(entry, 'danger')
  const m = levelOf(entry, 'management')
  if (!(u && d && m)) return null
  const score =
    Math.round(100 * ((0.5 * (u - 1)) / 2 + 0.3 * (1 - (d - 1) / 4) + 0.2 * (1 - (m - 1) / 3))) / 10
  const tier = VERDICTS.find((t) => score >= t.min) ?? VERDICTS[VERDICTS.length - 1]!
  return { score, tier: tier.key }
}
