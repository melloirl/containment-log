import { describe, expect, it } from 'vitest'
import { formatDate, lostRemark } from './format'

describe('lostRemark', () => {
  it('uses the legacy thresholds', () => {
    expect(lostRemark(0)).toBe('A clean record. So far.')
    expect(lostRemark(1)).toBe('Acceptable losses.')
    expect(lostRemark(4)).toBe('Acceptable losses.')
    expect(lostRemark(5)).toBe('HR has questions.')
    expect(lostRemark(14)).toBe('HR has questions.')
    expect(lostRemark(15)).toBe('Maybe try a different work type.')
  })
})

describe('formatDate', () => {
  it('formats like toLocaleString with day, short month and year', () => {
    const t = Date.UTC(2026, 10, 24, 12)
    expect(formatDate(t)).toBe(
      new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    )
    expect(formatDate(t)).toMatch(/2026/)
  })
})
