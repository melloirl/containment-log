/** A YYYY-MM-DD day in the given locale, e.g. "24 Nov 2026". Returns the input when it cannot be read. */
export function formatDay(day: string, locale: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const date = new Date(Date.UTC(y ?? NaN, (m ?? NaN) - 1, d ?? NaN))
  if (Number.isNaN(date.getTime())) return day
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** Which remark goes next to the agents-lost count, as a key under `lost.remark`. */
export function lostRemark(lost: number): 'clean' | 'acceptable' | 'questions' | 'tooMany' {
  if (lost === 0) return 'clean'
  if (lost < 5) return 'acceptable'
  if (lost < 15) return 'questions'
  return 'tooMany'
}
