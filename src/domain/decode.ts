import { FORM, ORIGIN } from './catalog'
import type { Abnormality } from './types'

/** "Original origin, humanoid form", read from the classification code. */
export function decode(abnormality: Abnormality): string {
  if (!abnormality.letter) return 'No standard code on file, tool form'
  return (
    ORIGIN[abnormality.letter] + ' origin, ' + (FORM[abnormality.form ?? ''] || 'unknown') + ' form'
  )
}
