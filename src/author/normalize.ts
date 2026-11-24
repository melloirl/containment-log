import { AXES, WORKS } from '@/domain/catalog'
import type { AxisKey, Entry, Rating, WorkKey } from '@/domain/types'
import type { AuthorContent } from './protocol'

/** A change to an entry. `undefined` for an axis or a work type clears it. */
export interface EntryPatch {
  readonly logged?: string
  readonly rating?: Partial<Record<AxisKey, string | undefined>>
  readonly fan?: boolean
  readonly works?: Partial<Record<WorkKey, 'good' | 'bad' | undefined>>
  readonly agentsLost?: number
}

/**
 * The entry as it is written to disk: keys in a fixed order, and nothing that
 * says "not set" (no empty rating, no `fan: false`, no zero count). The same
 * edits always give the same file, so diffs stay small.
 */
export function normalizeEntry(entry: Entry): Entry {
  const rating: Record<string, string> = {}
  for (const { key } of AXES) {
    const level = entry.rating?.[key]
    if (level) rating[key] = level
  }
  const works: Partial<Record<WorkKey, 'good' | 'bad'>> = {}
  for (const { key } of WORKS) {
    const result = entry.works?.[key]
    if (result) works[key] = result
  }
  const lost = Math.max(0, Math.trunc(entry.agentsLost ?? 0))
  return {
    logged: entry.logged,
    ...(Object.keys(rating).length ? { rating: rating as Rating } : {}),
    ...(entry.fan ? { fan: true } : {}),
    ...(Object.keys(works).length ? { works } : {}),
    ...(lost ? { agentsLost: lost } : {}),
  }
}

export function patchEntry(entry: Entry, patch: EntryPatch): Entry {
  return normalizeEntry({
    ...entry,
    ...patch,
    rating: { ...entry.rating, ...patch.rating } as Rating,
    works: { ...entry.works, ...patch.works } as Entry['works'],
  })
}

/**
 * The content files: entries in roster order, and a note only where there is
 * an entry and something written.
 */
export function toFiles(content: AuthorContent, order: readonly string[]): AuthorContent {
  const entries: Record<string, Entry> = {}
  const notes: Record<string, string> = {}
  for (const code of order) {
    const entry = content.entries[code]
    if (!entry) continue
    entries[code] = normalizeEntry(entry)
    const note = content.notes[code]?.trim()
    if (note) notes[code] = note
  }
  return { entries, notes }
}

/** Today in the author's time zone, as YYYY-MM-DD. */
export function today(now = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
