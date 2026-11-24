import { computed, readonly, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { visibleUnits } from '@/domain/roster'
import type { Abnormality, RosterFilter, UnitView } from '@/domain/types'
import { useContainmentLog, type ContainmentLog } from './useContainmentLog'

/**
 * Session state for browsing the roster: what is typed, which filter is on,
 * which file is open.
 *
 * One instance per page.
 */
export interface LogBrowser {
  readonly query: Ref<string>
  readonly filter: Ref<RosterFilter>
  readonly loggedOnly: Ref<boolean>

  readonly selectedCode: Readonly<Ref<string | null>>
  readonly selected: ComputedRef<Abnormality | null>
  /**
   * Counts select() calls, including a second click on the tile that is already open.
   * Watch it to react to the reader opening a tile; selectedCode alone misses the repeat.
   */
  readonly selectCount: Readonly<Ref<number>>

  /** Tiles to show, filtered and sorted. */
  readonly units: ComputedRef<readonly UnitView[]>

  select(code: string): void
  /** Closes the file and returns the code that was open, so the caller can return focus to its tile. */
  close(): string | null
}

export function createLogBrowser(log: ContainmentLog): LogBrowser {
  const query = ref('')
  const filter = ref<RosterFilter>('all')
  const loggedOnly = ref(false)
  const selectedCode = ref<string | null>(null)
  const selectCount = ref(0)

  const selected = computed(() =>
    selectedCode.value === null ? null : (log.byCode(selectedCode.value) ?? null),
  )
  const units = computed(() =>
    visibleUnits(log.roster.value, log.entries, log.shield.value, {
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
    selectCount: readonly(selectCount),
    units,

    select(code) {
      selectedCode.value = code
      selectCount.value++
    },
    close() {
      const code = selectedCode.value
      selectedCode.value = null
      return code
    },
  }
}

let instance: LogBrowser | undefined

/** The page-wide browsing state, over useContainmentLog(). Created on first use. */
export function useLogBrowser(): LogBrowser {
  instance ??= createLogBrowser(useContainmentLog())
  return instance
}
