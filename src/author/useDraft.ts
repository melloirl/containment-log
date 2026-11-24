import { reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { LogSource } from '@/composables/useContainmentLog'
import { ENTRIES } from '@/content/entries'
import { CATALOG } from '@/domain/catalog'
import type { Entry } from '@/domain/types'
import en from '@/i18n/locales/en'
import { authorApi, type AuthorApi } from './api'
import { patchEntry, toFiles, today, type EntryPatch } from './normalize'
import type { AuthorStatus, PublishResult } from './protocol'

/** How long after the last edit the files are written. */
const SAVE_DELAY = 400

/**
 * The author's working copy of the log. The page reads it in place of the
 * built-in content, so every edit shows at once; edits are written to the
 * content files shortly after, and publish() commits and pushes them.
 *
 * One instance per page, and only in author mode.
 */
export interface Draft {
  /** What the page reads. */
  readonly source: LogSource
  readonly saving: Readonly<Ref<'saved' | 'pending' | 'failed'>>
  /** Why the last save or publish failed. */
  readonly error: Readonly<Ref<string | null>>
  /** The repository as of the last save; null until the dev server answers. */
  readonly status: Readonly<Ref<AuthorStatus | null>>

  /** Starts an entry dated today. */
  log(code: string): void
  /** Deletes the entry and its note. */
  remove(code: string): void
  update(code: string, patch: EntryPatch): void
  setNote(code: string, text: string): void
  /** Writes pending edits now. */
  flush(): Promise<void>
  publish(message: string): Promise<PublishResult>
}

export function createDraft(
  api: AuthorApi,
  initial: { entries: Readonly<Record<string, Entry>>; notes: Readonly<Record<string, string>> },
): Draft {
  const state = reactive({
    entries: { ...initial.entries } as Record<string, Entry>,
    notes: { ...initial.notes } as Record<string, string>,
  })
  const saving = ref<'saved' | 'pending' | 'failed'>('saved')
  const error = ref<string | null>(null)
  const status = ref<AuthorStatus | null>(null)
  const order = CATALOG.map((a) => a.code)

  let timer: ReturnType<typeof setTimeout> | undefined
  let writing: Promise<void> = Promise.resolve()

  function write(): Promise<void> {
    clearTimeout(timer)
    timer = undefined
    const files = toFiles(state, order)
    // One write at a time, in order, so an older save never lands on top of a newer one.
    writing = writing.then(async () => {
      try {
        status.value = await api.save(files)
        error.value = null
        if (timer === undefined) saving.value = 'saved'
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : String(cause)
        saving.value = 'failed'
      }
    })
    return writing
  }

  watch(
    state,
    () => {
      saving.value = 'pending'
      clearTimeout(timer)
      timer = setTimeout(() => void write(), SAVE_DELAY)
    },
    { deep: true },
  )

  api.status().then(
    (answer) => (status.value = answer),
    (cause: unknown) => (error.value = cause instanceof Error ? cause.message : String(cause)),
  )

  const flush = (): Promise<void> => (timer === undefined ? writing : write())

  return {
    source: { entries: state.entries, note: (code) => state.notes[code] || undefined },
    saving,
    error,
    status,

    log(code) {
      state.entries[code] ??= { logged: today() }
    },
    remove(code) {
      delete state.entries[code]
      delete state.notes[code]
    },
    update(code, patch) {
      const entry = state.entries[code]
      if (entry) state.entries[code] = patchEntry(entry, patch)
    },
    setNote(code, text) {
      if (state.entries[code]) state.notes[code] = text
    },
    flush,
    async publish(message) {
      await flush()
      if (saving.value === 'failed') throw new Error(error.value ?? 'The last save failed.')
      try {
        const result = await api.publish(message)
        status.value = result.status
        error.value = null
        return result
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : String(cause)
        throw cause
      }
    },
  }
}

let instance: Draft | undefined

/** The page-wide draft, starting from the content files as the dev server served them. */
export function useDraft(): Draft {
  instance ??= createDraft(authorApi, { entries: ENTRIES, notes: en.notes })
  return instance
}
