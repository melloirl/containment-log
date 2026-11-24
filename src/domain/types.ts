/**
 * Domain model. Pure types: no Vue, no DOM, no text for the reader.
 *
 * Everything a person reads (names, labels, notes) lives in the locale files
 * under src/i18n/locales. The domain deals in codes and keys.
 */

/* ---------- catalog ---------- */

/** Position in RISKS, from ZAYIN (0) to ALEPH (4). */
export type RiskIndex = 0 | 1 | 2 | 3 | 4

export interface RiskLevel {
  /** In-game name. A proper noun, shown as is in every language. */
  readonly key: 'ZAYIN' | 'TETH' | 'HE' | 'WAW' | 'ALEPH'
  /** Hex colour that drives `--c` wherever the risk is shown. */
  readonly color: string
}

export type OriginLetter = 'O' | 'T' | 'F' | 'D'

/** One row of the roster, without its name. */
export interface CatalogEntry {
  readonly code: string
  readonly risk: RiskIndex
  /** Cell in the silhouette atlas (10 columns by 9 rows, row-major). */
  readonly portrait: number
  /** Path of the in-game portrait on the wiki, relative to WIKI_ORIGIN. */
  readonly portraitPath: string
  /** Parsed from a standard code such as O-03-03; null when the code is non-standard. */
  readonly letter: OriginLetter | null
  /** Key of the form message, read from the code's middle digits; null when unknown or non-standard. */
  readonly form: string | null
  /** Trailing number of the code; 999 when the code is non-standard. Sort key under the spoiler shield. */
  readonly num: number
  /** Tools have no work results. Non-standard codes count as tools. */
  readonly tool: boolean
}

/** A roster row with its name in the reader's language. */
export interface Abnormality extends CatalogEntry {
  readonly name: string
}

export type WorkKey = 'instinct' | 'insight' | 'attachment' | 'repression'

export interface WorkType {
  readonly key: WorkKey
  /** Hex colour that drives `--w`. */
  readonly color: string
}

export type AxisKey = 'usefulness' | 'danger' | 'management'

export interface ReviewAxis {
  readonly key: AxisKey
  /** Name of the CSS custom property that colours the axis, e.g. `--useful`. Drives `--k`. */
  readonly colorVar: string
  /** Level keys from least to most. */
  readonly levels: readonly string[]
}

export type VerdictTierKey = 'always' | 'good' | 'fair' | 'desperate' | 'never'

export interface VerdictTier {
  readonly key: VerdictTierKey
  /** Lowest score (out of 10) that earns this tier. */
  readonly min: number
}

export interface Verdict {
  readonly score: number
  readonly tier: VerdictTierKey
}

/* ---------- authored content ---------- */

export type UsefulnessLevel = 'useless' | 'neutral' | 'useful'
export type DangerLevel = 'peaceful' | 'safeish' | 'neutral' | 'dangerous' | 'extreme'
export type ManagementLevel = 'none' | 'periodic' | 'constant' | 'micromanage'

export interface Rating {
  readonly usefulness?: UsefulnessLevel
  readonly danger?: DangerLevel
  readonly management?: ManagementLevel
}

/**
 * One logged abnormality, written by hand in src/content/entries.ts.
 * Its note is text, so it lives in the locale files under `notes`.
 */
export interface Entry {
  /** Day of the first encounter, as YYYY-MM-DD. */
  readonly logged: string
  /** Leave an axis out until it is rated. The verdict needs all three. */
  readonly rating?: Rating
  readonly fan?: boolean
  /** Leave a work type out while its result is unknown. */
  readonly works?: Partial<Readonly<Record<WorkKey, 'good' | 'bad'>>>
  readonly agentsLost?: number
}

/* ---------- roster browsing ---------- */

/** 'all', a RiskIndex as a string, or 'tools'. */
export type RosterFilter = 'all' | '0' | '1' | '2' | '3' | '4' | 'tools'

export interface RosterQuery {
  readonly q: string
  readonly filter: RosterFilter
  readonly loggedOnly: boolean
}

/** One tile of the grid, already resolved against the entries and the spoiler shield. */
export interface UnitView {
  readonly abnormality: Abnormality
  /** Has an entry. */
  readonly met: boolean
  /** No entry while the spoiler shield is on: name, silhouette and risk are hidden. */
  readonly sealed: boolean
  /** Sealed, but the search typed three or more letters of its name, so the name shows. */
  readonly peek: boolean
}
