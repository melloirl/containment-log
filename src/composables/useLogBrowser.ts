import { computed, readonly, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { byCode } from '@/domain/catalog'
import { visibleUnits } from '@/domain/roster'
import type { Abnormality, RosterFilter, UnitView } from '@/domain/types'
import { useContainmentLog, type ContainmentLog } from './useContainmentLog'

/**
 * Session UI state for browsing the roster: what is typed, which filter is on,
 * which file is open. Nothing here is persisted.
 *
 * One instance per page.
 */
export interface LogBrowser {
  readonly query: Ref<string>
  readonly filter: Ref<RosterFilter>
  readonly loggedOnly: Ref<boolean>

  readonly selectedCode: Readonly<Ref<string | null>>
  readonly selected: ComputedRef<Abnormality | null>
  /** The open file is asking whether to remove its entry. Reset by select() and close(). */
  readonly confirmingRemoval: Ref<boolean>
  /**
   * Code logged a moment ago: its tile plays the flash. It stays set until the next
   * thing the user does to the roster: opening or closing a file, searching, filtering,
   * or a clearFresh() from whoever handled an action on the log.
   */
  readonly freshCode: Readonly<Ref<string | null>>

  /**
   * Counts select() calls, including a second click on the tile that is already open.
   * Watch it to react to the user opening a tile; selectedCode alone misses the repeat.
   */
  readonly selectCount: Readonly<Ref<number>>

  /** Tiles to show, filtered and sorted. */
  readonly units: ComputedRef<readonly UnitView[]>

  /** Opens a file. Selecting the open file again still resets confirmingRemoval. */
  select(code: string): void
  /** Closes the file and returns the code that was open, so the caller can return focus to its tile. */
  close(): string | null
  markFresh(code: string): void
  clearFresh(): void
}

/** Browsing state over the given log store. */
export function createLogBrowser(log: ContainmentLog): LogBrowser {
  const query = ref('')
  const filter = ref<RosterFilter>('all')
  const loggedOnly = ref(false)
  const selectedCode = ref<string | null>(null)
  const confirmingRemoval = ref(false)
  const selectCount = ref(0)
  const freshCode = ref<string | null>(null)
  const clearFresh = () => {
    freshCode.value = null
  }
  // Sync, so a later markFresh() in the same tick is not undone by an earlier change.
  watch([query, filter, loggedOnly], clearFresh, { flush: 'sync' })

  const selected = computed(() =>
    selectedCode.value === null ? null : (byCode(selectedCode.value) ?? null),
  )
  const units = computed(() =>
    visibleUnits(log.state, {
      q: query.value,
      filter: filter.value,
      loggedOnly: loggedOnly.value,
    }),
  )

  return {
    query,
    filter,
    loggedOnly,
    selectedCode: readonly(selectedCode),
    selected,
    confirmingRemoval,
    freshCode: readonly(freshCode),
    selectCount: readonly(selectCount),
    units,

    select(code) {
      selectedCode.value = code
      confirmingRemoval.value = false
      selectCount.value++
      clearFresh()
    },
    close() {
      const code = selectedCode.value
      selectedCode.value = null
      confirmingRemoval.value = false
      clearFresh()
      return code
    },
    markFresh(code) {
      freshCode.value = code
    },
    clearFresh,
  }
}

let instance: LogBrowser | undefined

/** The page-wide browsing state, over useContainmentLog(). Created on first use. */
export function useLogBrowser(): LogBrowser {
  instance ??= createLogBrowser(useContainmentLog())
  return instance
}
