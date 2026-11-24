/** Date an entry was first logged, in the reader's locale, e.g. "24 Nov 2026". Empty when the date cannot be formatted. */
export function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/** The remark next to the agents-lost counter. */
export function lostRemark(lost: number): string {
  if (lost === 0) return 'A clean record. So far.'
  if (lost < 5) return 'Acceptable losses.'
  if (lost < 15) return 'HR has questions.'
  return 'Maybe try a different work type.'
}
