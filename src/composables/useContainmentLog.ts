import { computed, reactive, readonly, ref, toRaw } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { ABNORMALITIES } from '@/domain/catalog'
import { blankEntry, normalize } from '@/domain/log-state'
import type {
  Abnormality,
  AxisKey,
  Entry,
  EntryView,
  LogState,
  LogStateView,
  RestoreResult,
  WorkKey,
} from '@/domain/types'
import { createLocalLogStorage, type LogStorage } from '@/services/storage'

export interface LogSummary {
  /** Logged abnormalities, lowest risk first; roster order within a risk level. */
  readonly logged: readonly Abnormality[]
  /** Agents lost across every entry. */
  readonly lost: number
  /** Entries with the fan flag. */
  readonly fans: number
}

/**
 * The log store: the only writer of persisted state.
 *
 * One instance per page. Every action persists before it returns, and flips
 * `storageOk` to false the first time the browser refuses to store.
 */
export interface ContainmentLog {
  /** Reactive and read-only. Change it through the actions below. */
  readonly state: LogStateView
  /** False once localStorage has failed a read or a write. */
  readonly storageOk: Readonly<Ref<boolean>>
  readonly summary: ComputedRef<LogSummary>

  entry(code: string): EntryView | undefined

  /** Creates a blank entry stamped with the current time. No-op when already logged. */
  logEncounter(code: string): void
  removeEntry(code: string): void
  /** Sets the level (1-based), or clears it to 0 when it is already at that level. */
  rate(code: string, axis: AxisKey, level: number): void
  toggleFan(code: string): void
  /** unknown, then goes well, then avoid, then unknown again. */
  cycleWork(code: string, work: WorkKey): void
  /** Never drops below zero. */
  adjustLost(code: string, delta: number): void
  setNote(code: string, note: string): void
  setShield(on: boolean): void

  /** The exact text kept in localStorage. */
  exportBackup(): string
  /** Replaces the whole log when `raw` is a backup; leaves it alone otherwise. */
  restoreBackup(raw: string): RestoreResult
  /** Drops every entry and keeps the spoiler shield setting. */
  eraseAll(): void
}

/** A log store over the given storage. Loads once, now. */
export function createContainmentLog(storage: LogStorage): ContainmentLog {
  const loaded = storage.load()
  const target: LogState = reactive(loaded.state) as LogState
  const storageOk = ref(loaded.ok)
  const state = readonly(target) as LogStateView

  function persist(): void {
    if (!storage.save(toRaw(target))) storageOk.value = false
  }

  /** Runs `change` on the entry and persists; does nothing when the code has no entry. */
  function withEntry(code: string, change: (e: Entry) => void): void {
    const e = target.entries[code]
    if (!e) return
    change(e)
    persist()
  }

  const summary = computed<LogSummary>(() => {
    // Array.prototype.sort is stable, so roster order holds within a risk level.
    const logged = ABNORMALITIES.filter((a) => !!state.entries[a.code]).sort(
      (a, b) => a.risk - b.risk,
    )
    let lost = 0
    let fans = 0
    for (const a of logged) {
      const e = state.entries[a.code]!
      lost += e.lost
      if (e.fan) fans++
    }
    return { logged, lost, fans }
  })

  return {
    state,
    storageOk: readonly(storageOk),
    summary,

    entry(code) {
      return state.entries[code]
    },

    logEncounter(code) {
      if (target.entries[code]) return
      target.entries[code] = blankEntry(Date.now())
      persist()
    },
    removeEntry(code) {
      withEntry(code, () => {
        delete target.entries[code]
      })
    },
    rate(code, axis, level) {
      withEntry(code, (e) => {
        e.a[axis] = e.a[axis] === level ? 0 : level
      })
    },
    toggleFan(code) {
      withEntry(code, (e) => {
        e.fan = !e.fan
      })
    },
    cycleWork(code, work) {
      withEntry(code, (e) => {
        const current = e.w[work] || 0
        if (current === 0) e.w[work] = 1
        else if (current === 1) e.w[work] = -1
        else delete e.w[work]
      })
    },
    adjustLost(code, delta) {
      withEntry(code, (e) => {
        e.lost = Math.max(0, e.lost + delta)
      })
    },
    setNote(code, note) {
      const e = target.entries[code]
      if (!e || e.note === note) return
      e.note = note
      persist()
    },
    setShield(on) {
      target.shield = on
      persist()
    },

    exportBackup() {
      return JSON.stringify(toRaw(target))
    },
    restoreBackup(raw) {
      const text = raw.trim()
      if (!text) return { ok: false, reason: 'empty' }
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        return { ok: false, reason: 'not-json' }
      }
      // Same test as the legacy app: `{"entries":null}` passes and restores an empty log.
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof (parsed as { entries?: unknown }).entries !== 'object'
      )
        return { ok: false, reason: 'not-backup' }
      const next = normalize(parsed)
      target.shield = next.shield
      target.entries = next.entries
      persist()
      return { ok: true, count: Object.keys(next.entries).length }
    },
    eraseAll() {
      target.entries = {}
      persist()
    },
  }
}

let instance: ContainmentLog | undefined

/** The page-wide log store, backed by localStorage. Created on first use. */
export function useContainmentLog(): ContainmentLog {
  instance ??= createContainmentLog(createLocalLogStorage())
  return instance
}
