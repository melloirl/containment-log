/**
 * Domain model. Pure types: no Vue, no DOM.
 *
 * Two families live here:
 *  - catalog types describe the fixed roster and the rating vocabulary;
 *  - persisted types describe what sits in localStorage and in backup text.
 *
 * The persisted shape is schema v1 and is FROZEN. Field names, value ranges and
 * the order keys are written in must not change: a backup copied from the old
 * single-file app has to restore here, and the other way round.
 */

/* ---------- catalog ---------- */

/** Position in RISKS, from ZAYIN (0) to ALEPH (4). */
export type RiskIndex = 0 | 1 | 2 | 3 | 4

export interface RiskLevel {
  readonly key: 'ZAYIN' | 'TETH' | 'HE' | 'WAW' | 'ALEPH'
  /** Hex colour that drives `--c` wherever the risk is shown. */
  readonly color: string
}

export type OriginLetter = 'O' | 'T' | 'F' | 'D'

export interface Abnormality {
  readonly code: string
  readonly name: string
  readonly risk: RiskIndex
  /** Cell in the silhouette atlas (10 columns by 9 rows, row-major). */
  readonly portrait: number
  /** Path of the in-game portrait on the wiki, relative to WIKI_ORIGIN. */
  readonly portraitPath: string
  /** Parsed from a standard code such as O-03-03; null when the code is non-standard. */
  readonly letter: OriginLetter | null
  readonly form: string | null
  /** Trailing number of the code; 999 when the code is non-standard. Sort key under the spoiler shield. */
  readonly num: number
  /** Tools have no work results. Non-standard codes count as tools. */
  readonly tool: boolean
}

export type WorkKey = 'instinct' | 'insight' | 'attachment' | 'repression'

export interface WorkType {
  readonly key: WorkKey
  readonly label: string
  /** Hex colour that drives `--w`. */
  readonly color: string
}

export type AxisKey = 'u' | 'd' | 'm'

export interface ReviewAxis {
  readonly key: AxisKey
  readonly label: string
  /** Name of the CSS custom property that colours the axis, e.g. `--useful`. Drives `--k`. */
  readonly colorVar: string
  /** Level names from least to most. A stored rating is 0 (not rated) or the 1-based position. */
  readonly levels: readonly string[]
}

export interface VerdictTier {
  /** Lowest score (out of 10) that earns this tier. */
  readonly min: number
  readonly call: string
  readonly why: string
}

export interface Verdict {
  readonly score: number
  readonly call: string
  readonly why: string
}

/* ---------- persisted, schema v1 (frozen) ---------- */

/** 1 = goes well, -1 = avoid. Unknown is stored as an absent key. */
export type WorkResult = 1 | -1

export interface Scrap {
  t: number
  x: string
}

/** Key order when written: met, a, fan, w, lost, note, scraps, then r if present. */
export interface Entry {
  /** Timestamp (ms) of the first logged encounter. */
  met: number
  a: Record<AxisKey, number>
  fan: boolean
  w: Partial<Record<WorkKey, WorkResult>>
  lost: number
  note: string
  /** No screen for now; kept in storage and backups. */
  scraps: Scrap[]
  /** Ratings from the old three-icon scale; carried through untouched. */
  r?: Record<string, unknown>
}

/** Key order when written: v, shield, entries. */
export interface LogState {
  v: 1
  shield: boolean
  entries: Record<string, Entry>
}

export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

/** What components receive. Only the log store writes to the state. */
export type EntryView = DeepReadonly<Entry>
export type LogStateView = DeepReadonly<LogState>

/* ---------- roster browsing ---------- */

/** 'all', a RiskIndex as a string, or 'tools'. */
export type RosterFilter = 'all' | '0' | '1' | '2' | '3' | '4' | 'tools'

export interface RosterQuery {
  readonly q: string
  readonly filter: RosterFilter
  readonly loggedOnly: boolean
}

/** One tile of the grid, already resolved against the log and the spoiler shield. */
export interface UnitView {
  readonly abnormality: Abnormality
  /** Logged at least once. */
  readonly met: boolean
  /** Not logged while the spoiler shield is on: name, silhouette and risk are hidden. */
  readonly sealed: boolean
  /** Sealed, but the search typed three or more letters of its name, so the name shows. */
  readonly peek: boolean
}

export type RestoreResult =
  | { readonly ok: true; readonly count: number }
  | { readonly ok: false; readonly reason: 'empty' | 'not-json' | 'not-backup' }
