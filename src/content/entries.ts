import type { Entry } from '@/domain/types'

/**
 * The log: one entry per abnormality that has been met, keyed by classification code.
 *
 * To log one, add its code here and, if it deserves a note, add the note under
 * `notes` in src/i18n/locales/en.ts. The tests check that every code exists in
 * the roster. The rating words are the level keys in src/domain/types.ts.
 */
export const ENTRIES: Readonly<Record<string, Entry>> = {
  'O-03-03': {
    logged: '2026-11-24',
    rating: { usefulness: 'useful', danger: 'peaceful', management: 'none' },
  },
  'F-05-52': {
    logged: '2026-11-24',
    rating: { usefulness: 'useful', danger: 'safeish', management: 'none' },
  },
  'O-03-60': {
    logged: '2026-11-24',
    rating: { usefulness: 'neutral', danger: 'dangerous', management: 'periodic' },
  },
  'O-02-56': { logged: '2026-11-24' },
  'T-09-09': { logged: '2026-11-24' },
  'O-01-92': { logged: '2026-11-24' },
}
