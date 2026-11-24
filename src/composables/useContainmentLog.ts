import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { ENTRIES } from '@/content/entries'
import { CATALOG } from '@/domain/catalog'
import type { Abnormality, Entry } from '@/domain/types'
import { authored } from '@/i18n'

export interface LogSummary {
  /** Logged abnormalities, lowest risk first; roster order within a risk level. */
  readonly logged: readonly Abnormality[]
  /** Agents lost across every entry. */
  readonly lost: number
  /** Entries with the fan flag. */
  readonly fans: number
}

/** Where the entries and notes come from. */
export interface LogSource {
  readonly entries: Readonly<Record<string, Entry>>
  /** The field note in the reader's language, if one was written. */
  note(code: string): string | undefined
}

/** The content in the repository, as built into the page. */
const PUBLISHED: LogSource = {
  entries: ENTRIES,
  note: (code) => authored('notes', code),
}

/**
 * The guide's content, ready to show: the roster with names in the reader's
 * language, the authored entries and notes, and the spoiler shield.
 *
 * Nothing is saved. The content is files in the repository; the shield is the
 * one thing a reader can change, and it starts on at every visit.
 *
 * One instance per page.
 */
export interface ContainmentLog {
  readonly roster: ComputedRef<readonly Abnormality[]>
  readonly entries: Readonly<Record<string, Entry>>
  readonly summary: ComputedRef<LogSummary>
  /** Hides the name, silhouette and risk of abnormalities that have no entry. */
  readonly shield: Ref<boolean>

  byCode(code: string): Abnormality | undefined
  entry(code: string): Entry | undefined
  /** The field note in the reader's language, if one was written. */
  note(code: string): string | undefined
}

export function createContainmentLog(source: LogSource = PUBLISHED): ContainmentLog {
  const { entries } = source
  const roster = computed<readonly Abnormality[]>(() =>
    CATALOG.map((row) => ({ ...row, name: authored('abnormalities', row.code) ?? row.code })),
  )
  const index = computed(() => new Map(roster.value.map((a) => [a.code, a])))

  const summary = computed<LogSummary>(() => {
    // Array.prototype.sort is stable, so roster order holds within a risk level.
    const logged = roster.value.filter((a) => entries[a.code]).sort((a, b) => a.risk - b.risk)
    let lost = 0
    let fans = 0
    for (const a of logged) {
      const e = entries[a.code]!
      lost += e.agentsLost ?? 0
      if (e.fan) fans++
    }
    return { logged, lost, fans }
  })

  return {
    roster,
    entries,
    summary,
    shield: ref(true),
    byCode: (code) => index.value.get(code),
    entry: (code) => entries[code],
    note: (code) => source.note(code),
  }
}

let source = PUBLISHED
let instance: ContainmentLog | undefined

/** The page-wide instance. Created on first use. */
export function useContainmentLog(): ContainmentLog {
  instance ??= createContainmentLog(source)
  return instance
}

/** Points the page-wide instance at another source. Author mode calls this before the app mounts. */
export function readLogFrom(next: LogSource): void {
  source = next
  instance = undefined
}
