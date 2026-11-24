import { blankState, normalize } from '@/domain/log-state'
import type { LogState, LogStateView } from '@/domain/types'

export const STORAGE_KEY = 'containment-log-v1'

/** Where the log is kept. Each call reports whether the browser accepted it. */
export interface LogStorage {
  /** The stored log, normalized; a blank log when nothing is stored or reading failed (`ok` false). */
  load(): { state: LogState; ok: boolean }
  /** Writes `JSON.stringify(state)`; false when the browser refused. */
  save(state: LogStateView): boolean
}

/** LogStorage over `localStorage`, under STORAGE_KEY. */
export function createLocalLogStorage(): LogStorage {
  return {
    load() {
      try {
        // A write probe catches storage that reads but refuses writes (private modes, full quota).
        localStorage.setItem(STORAGE_KEY + '-probe', '1')
        localStorage.removeItem(STORAGE_KEY + '-probe')
        const raw = localStorage.getItem(STORAGE_KEY)
        // A parse failure lands in the catch and counts as a storage failure, as in the legacy app.
        if (raw) return { state: normalize(JSON.parse(raw)), ok: true }
      } catch {
        return { state: blankState(), ok: false }
      }
      return { state: blankState(), ok: true }
    },
    save(state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        return true
      } catch {
        return false
      }
    },
  }
}
