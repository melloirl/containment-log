// Guards for hand-written content: a typo in a code or a missing label fails here, not on the page.
import { describe, expect, it } from 'vitest'
import { createContainmentLog } from '@/composables/useContainmentLog'
import { AXES, CATALOG, FORM, VERDICTS, WORKS } from '@/domain/catalog'
import { i18n } from '@/i18n'
import en from '@/i18n/locales/en'
import { ENTRIES } from './entries'

const codes = new Set(CATALOG.map((a) => a.code))
const { te } = i18n.global

describe('entries', () => {
  it('only use codes from the roster', () => {
    expect(Object.keys(ENTRIES).filter((code) => !codes.has(code))).toEqual([])
  })

  it('have a real YYYY-MM-DD day', () => {
    for (const [code, entry] of Object.entries(ENTRIES)) {
      expect(entry.logged, code).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(entry.logged)), code).toBe(false)
    }
  })
})

describe('English locale', () => {
  it('names every abnormality in the roster, and nothing else', () => {
    expect(Object.keys(en.abnormalities).sort()).toEqual([...codes].sort())
  })

  it('only has notes for logged abnormalities', () => {
    expect(Object.keys(en.notes).filter((code) => !ENTRIES[code])).toEqual([])
  })

  it('labels every key the catalog uses', () => {
    const keys = [
      ...AXES.flatMap((x) => [`axis.${x.key}.label`, ...x.levels.map((l) => `axis.${x.key}.levels.${l}`)]),
      ...WORKS.map((w) => `works.${w.key}`),
      ...VERDICTS.flatMap((v) => [`verdict.${v.key}.call`, `verdict.${v.key}.why`]),
      ...Object.values(FORM).map((f) => `form.${f}`),
      ...['O', 'T', 'F', 'D'].map((o) => `origin.${o}`),
    ]
    expect(keys.filter((key) => !te(key))).toEqual([])
  })
})

describe('the log', () => {
  const log = createContainmentLog()

  it('gives the roster its names and the entries their notes, as written', () => {
    expect(log.byCode('Bald-Is-Awesome!')?.name).toBe("You're Bald...")
    expect(log.note('O-03-03')).toContain('panic + a matching resist E.G.O suit')
    expect(log.note('O-01-92')).toBeUndefined()
  })

  it('totals the logged abnormalities, lowest risk first', () => {
    const { logged, lost, fans } = log.summary.value
    expect(logged).toHaveLength(Object.keys(ENTRIES).length)
    expect(logged.map((a) => a.risk)).toEqual([...logged.map((a) => a.risk)].sort())
    expect(lost).toBe(Object.values(ENTRIES).reduce((n, e) => n + (e.agentsLost ?? 0), 0))
    expect(fans).toBe(Object.values(ENTRIES).filter((e) => e.fan).length)
  })
})
