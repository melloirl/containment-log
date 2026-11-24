// What the page and the dev server's author endpoints (tools/author-plugin.ts) say to each other.
import type { Entry } from '@/domain/types'

/** The two content files, as written to disk. */
export interface AuthorContent {
  /** src/content/entries.json */
  readonly entries: Readonly<Record<string, Entry>>
  /** src/i18n/locales/en.notes.json */
  readonly notes: Readonly<Record<string, string>>
}

/** One abnormality whose entry or note on disk differs from the last commit. */
export interface Change {
  readonly code: string
  readonly kind: 'added' | 'updated' | 'removed'
}

export interface AuthorStatus {
  readonly branch: string
  /** Web address of the repository, when the remote is on GitHub. */
  readonly repo: string | null
  readonly changes: readonly Change[]
  /** Commits not pushed yet. */
  readonly unpushed: number
}

export interface PublishResult {
  /** Short hash of the commit now on the remote. */
  readonly commit: string
  readonly status: AuthorStatus
}

export const AUTHOR_ENDPOINT = '/__author'
