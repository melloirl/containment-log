import type { Entry } from '@/domain/types'
import data from './entries.json'

/**
 * The log: one entry per abnormality that has been met, keyed by classification code.
 *
 * The data is entries.json, and each entry's note is in the locale's notes file
 * (src/i18n/locales/en.notes.json). Author mode writes both; see README. The
 * tests check every code, rating word and work result against the catalog.
 */
export const ENTRIES = data as Readonly<Record<string, Entry>>
