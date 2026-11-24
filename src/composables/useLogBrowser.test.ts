import { describe, expect, it } from 'vitest'
import { blankState } from '@/domain/log-state'
import type { LogStorage } from '@/services/storage'
import { createContainmentLog } from './useContainmentLog'
import { createLogBrowser } from './useLogBrowser'

const memory = (): LogStorage => ({ load: () => ({ state: blankState(), ok: true }), save: () => true })

describe('createLogBrowser', () => {
  it('starts with nothing typed, all units and no file open', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    expect(b.query.value).toBe('')
    expect(b.filter.value).toBe('all')
    expect(b.loggedOnly.value).toBe(false)
    expect(b.selectedCode.value).toBeNull()
    expect(b.selected.value).toBeNull()
    expect(b.units.value).toHaveLength(85)
  })

  it('select opens a file and resets the removal confirmation, even for the open file', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    b.select('O-01-45')
    expect(b.selected.value!.name).toBe('Plague Doctor')
    b.confirmingRemoval.value = true
    b.select('O-01-45')
    expect(b.confirmingRemoval.value).toBe(false)
    b.confirmingRemoval.value = true
    b.select('O-03-03')
    expect(b.confirmingRemoval.value).toBe(false)
    expect(b.selectedCode.value).toBe('O-03-03')
  })

  it('close clears the selection and confirmation and returns the open code', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    expect(b.close()).toBeNull()
    b.select('O-01-45')
    b.confirmingRemoval.value = true
    expect(b.close()).toBe('O-01-45')
    expect(b.selectedCode.value).toBeNull()
    expect(b.confirmingRemoval.value).toBe(false)
  })

  it('freshCode lasts until the next thing done to the roster', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    const endings: Array<() => void> = [
      () => b.select('O-03-03'),
      () => b.close(),
      () => (b.query.value = 'bird'),
      () => (b.filter.value = 'tools'),
      () => (b.loggedOnly.value = true),
      () => b.clearFresh(),
    ]
    for (const end of endings) {
      b.markFresh('O-01-45')
      expect(b.freshCode.value).toBe('O-01-45')
      end()
      expect(b.freshCode.value).toBeNull()
    }
  })

  it('a filter change does not undo a markFresh that follows it', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    b.filter.value = '2'
    b.markFresh('O-01-45')
    expect(b.freshCode.value).toBe('O-01-45')
  })

  it('derives units from the query, the filter and the log', () => {
    const log = createContainmentLog(memory())
    const b = createLogBrowser(log)
    b.query.value = 'o-03'
    expect(b.units.value.map((u) => u.abnormality.code)).toEqual(
      expect.arrayContaining(['O-03-03', 'O-03-60']),
    )
    b.query.value = ''
    b.loggedOnly.value = true
    expect(b.units.value).toHaveLength(0)
    log.logEncounter('O-01-45')
    expect(b.units.value.map((u) => u.abnormality.code)).toEqual(['O-01-45'])
    b.loggedOnly.value = false
    b.filter.value = '0'
    expect(b.units.value.map((u) => u.abnormality.code)).toEqual(['O-01-45'])
    b.filter.value = '1'
    expect(b.units.value).toHaveLength(0)
    b.filter.value = 'tools'
    expect(b.units.value.length).toBeGreaterThan(0)
  })

  it('keeps the selection when a filter hides its tile', () => {
    const b = createLogBrowser(createContainmentLog(memory()))
    b.select('O-01-45')
    b.query.value = 'zzz'
    expect(b.units.value).toHaveLength(0)
    expect(b.selectedCode.value).toBe('O-01-45')
  })
})
