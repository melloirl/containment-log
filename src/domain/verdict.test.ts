import { describe, expect, it } from 'vitest'
import type { Entry, Rating } from './types'
import { levelOf, verdict } from './verdict'

const rated = (rating: Rating): Entry => ({ logged: '2026-11-24', rating })

describe('verdict', () => {
  it('is null until all three axes are rated', () => {
    expect(verdict({ logged: '2026-11-24' })).toBeNull()
    expect(verdict(rated({ usefulness: 'useful', danger: 'peaceful' }))).toBeNull()
  })

  it('scores the best and the worst reviews', () => {
    expect(verdict(rated({ usefulness: 'useful', danger: 'peaceful', management: 'none' }))).toEqual({
      score: 10,
      tier: 'always',
    })
    expect(verdict(rated({ usefulness: 'useless', danger: 'extreme', management: 'micromanage' }))).toEqual({
      score: 0,
      tier: 'never',
    })
  })

  it('matches the reviews already in the log', () => {
    expect(verdict(rated({ usefulness: 'useful', danger: 'safeish', management: 'none' }))).toEqual({
      score: 9.3,
      tier: 'always',
    })
    expect(verdict(rated({ usefulness: 'neutral', danger: 'dangerous', management: 'periodic' }))).toEqual({
      score: 4.6,
      tier: 'fair',
    })
  })

  it('reads a level as its position on the scale, 0 when missing', () => {
    const e = rated({ danger: 'dangerous' })
    expect(levelOf(e, 'danger')).toBe(4)
    expect(levelOf(e, 'usefulness')).toBe(0)
  })
})
