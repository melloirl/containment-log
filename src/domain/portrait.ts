import type { Abnormality } from './types'

export const WIKI_ORIGIN = 'https://lobotomycorporation.wiki.gg'

const ATLAS_COLUMNS = 10
const ATLAS_ROWS = 9

/** Mask position, in percent, of a silhouette inside the 10 by 9 atlas. */
export function spriteOffset(cell: number): { x: number; y: number } {
  return {
    x: ((cell % ATLAS_COLUMNS) * 100) / (ATLAS_COLUMNS - 1),
    y: (Math.floor(cell / ATLAS_COLUMNS) * 100) / (ATLAS_ROWS - 1),
  }
}

export function portraitUrl(abnormality: Abnormality): string {
  return WIKI_ORIGIN + abnormality.portraitPath
}
