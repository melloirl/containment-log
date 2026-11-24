import { describe, expect, it } from 'vitest'
import type { EntryView } from './types'
import { verdict } from './verdict'

const rated = (u: number, d: number, m: number) => ({ a: { u, d, m } }) as EntryView

describe('verdict', () => {
  it('is null until every axis is rated', () => {
    expect(verdict(rated(0, 0, 0))).toBeNull()
    expect(verdict(rated(0, 1, 1))).toBeNull()
    expect(verdict(rated(3, 0, 1))).toBeNull()
    expect(verdict(rated(3, 1, 0))).toBeNull()
  })

  it('scores the best and worst ratings', () => {
    expect(verdict(rated(3, 1, 1))).toEqual({
      score: 10,
      call: 'Always pick',
      why: 'Low drama, high output. Promote it.',
    })
    expect(verdict(rated(1, 5, 4))).toEqual({
      score: 0,
      call: 'Never again',
      why: 'Not worth the agents.',
    })
  })

  it('rounds to one decimal', () => {
    // 0.5*0.5 + 0.3*0.75 + 0.2*(2/3) = 0.6083 -> 6.1
    expect(verdict(rated(2, 2, 2))!.score).toBe(6.1)
  })

  it('places each tier boundary on the right side', () => {
    // Each tier's lowest score is reachable exactly; the next score down falls to the tier below.
    const cases: [number, number, number, number, string][] = [
      [3, 3, 1, 8.5, 'Always pick'],
      [3, 1, 4, 8, 'Good pick'],
      [3, 3, 4, 6.5, 'Good pick'],
      [3, 4, 3, 6.4, 'Fair trade'],
      [2, 5, 1, 4.5, 'Fair trade'],
      [1, 1, 2, 4.3, 'Only if desperate'],
      [2, 5, 4, 2.5, 'Only if desperate'],
      [1, 2, 4, 2.2, 'Never again'],
    ]
    for (const [u, d, m, score, call] of cases) {
      expect(verdict(rated(u, d, m)), `${u}${d}${m}`).toMatchObject({ score, call })
    }
  })
})
