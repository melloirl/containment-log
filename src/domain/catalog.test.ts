import { describe, expect, it } from 'vitest'
import { ABNORMALITIES, byCode } from './catalog'
import { decode } from './decode'

describe('catalog', () => {
  it('has the 85 released abnormalities with unique codes and atlas cells in order', () => {
    expect(ABNORMALITIES).toHaveLength(85)
    expect(new Set(ABNORMALITIES.map((a) => a.code)).size).toBe(85)
    expect(ABNORMALITIES.map((a) => a.portrait)).toEqual([...Array(85).keys()])
  })

  it('parses standard codes', () => {
    expect(byCode('O-03-03')).toMatchObject({ letter: 'O', form: '03', num: 3, tool: false, risk: 0 })
    expect(byCode('D-01-106')).toMatchObject({ letter: 'D', form: '01', num: 106, tool: false })
    expect(byCode('T-09-85')).toMatchObject({ form: '09', tool: true })
    expect(byCode('O-07-103')).toMatchObject({ form: '07', tool: true })
  })

  it('treats a non-standard code as a tool numbered 999', () => {
    expect(byCode('Bald-Is-Awesome!')).toMatchObject({ letter: null, form: null, num: 999, tool: true })
  })

  it('returns undefined for unknown codes, including prototype keys', () => {
    expect(byCode('X-00-00')).toBeUndefined()
    expect(byCode('constructor')).toBeUndefined()
    expect(byCode('__proto__')).toBeUndefined()
  })

  it('decodes origin and form', () => {
    expect(decode(byCode('O-01-45')!)).toBe('Original origin, humanoid form')
    expect(decode(byCode('F-05-52')!)).toBe('Fairy tale origin, machine or artifact form')
    expect(decode(byCode('Bald-Is-Awesome!')!)).toBe('No standard code on file, tool form')
  })
})
