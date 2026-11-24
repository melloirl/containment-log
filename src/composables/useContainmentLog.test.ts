import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isReadonly, isReactive, watchEffect } from 'vue'
import { blankState, normalize } from '@/domain/log-state'
import type { LogState, LogStateView } from '@/domain/types'
import type { LogStorage } from '@/services/storage'
import { createContainmentLog } from './useContainmentLog'

class MemoryStorage implements LogStorage {
  saved: string[] = []
  failSaves = false
  constructor(
    private initial: LogState = blankState(),
    private loadOk = true,
  ) {}
  load() {
    return { state: this.initial, ok: this.loadOk }
  }
  save(state: LogStateView) {
    if (this.failSaves) return false
    this.saved.push(JSON.stringify(state))
    return true
  }
  get last() {
    return this.saved.at(-1)
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('createContainmentLog', () => {
  it('exposes a reactive, read-only state', () => {
    const log = createContainmentLog(new MemoryStorage())
    expect(isReactive(log.state)).toBe(true)
    expect(isReadonly(log.state)).toBe(true)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ;(log.state as LogState).shield = false
    expect(log.state.shield).toBe(true)
    warn.mockRestore()
  })

  it('logs an encounter as the exact legacy blank entry and persists', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.logEncounter('O-01-45')
    expect(storage.last).toBe(
      '{"v":1,"shield":true,"entries":{"O-01-45":{"met":1000,"a":{"u":0,"d":0,"m":0},"fan":false,"w":{},"lost":0,"note":"","scraps":[]}}}',
    )
    expect(log.entry('O-01-45')!.met).toBe(1000)
  })

  it('does nothing when logging an encounter twice', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.logEncounter('O-01-45')
    vi.setSystemTime(5000)
    log.logEncounter('O-01-45')
    expect(storage.saved).toHaveLength(1)
    expect(log.entry('O-01-45')!.met).toBe(1000)
  })

  it('ignores every other action on a code with no entry, without persisting', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.removeEntry('O-01-45')
    log.rate('O-01-45', 'u', 2)
    log.toggleFan('O-01-45')
    log.cycleWork('O-01-45', 'insight')
    log.adjustLost('O-01-45', 1)
    log.setNote('O-01-45', 'hi')
    expect(storage.saved).toEqual([])
    expect(log.state.entries).toEqual({})
  })

  it('rates, and clears a rating when the same level is pressed again', () => {
    const log = createContainmentLog(new MemoryStorage())
    log.logEncounter('O-01-45')
    log.rate('O-01-45', 'd', 3)
    expect(log.entry('O-01-45')!.a.d).toBe(3)
    log.rate('O-01-45', 'd', 2)
    expect(log.entry('O-01-45')!.a.d).toBe(2)
    log.rate('O-01-45', 'd', 2)
    expect(log.entry('O-01-45')!.a.d).toBe(0)
  })

  it('cycles work results and deletes the key on returning to unknown', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.logEncounter('O-01-45')
    log.cycleWork('O-01-45', 'insight')
    expect(log.entry('O-01-45')!.w).toEqual({ insight: 1 })
    log.cycleWork('O-01-45', 'insight')
    expect(log.entry('O-01-45')!.w).toEqual({ insight: -1 })
    log.cycleWork('O-01-45', 'insight')
    expect('insight' in log.entry('O-01-45')!.w).toBe(false)
    expect(storage.last).toContain('"w":{}')
  })

  it('never drops agents lost below zero, toggles fan, skips unchanged notes', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.logEncounter('O-01-45')
    log.adjustLost('O-01-45', 1)
    log.adjustLost('O-01-45', -3)
    expect(log.entry('O-01-45')!.lost).toBe(0)
    log.toggleFan('O-01-45')
    expect(log.entry('O-01-45')!.fan).toBe(true)
    log.setNote('O-01-45', 'x')
    const count = storage.saved.length
    log.setNote('O-01-45', 'x')
    expect(storage.saved).toHaveLength(count)
  })

  it('writes the same text as the legacy app after a scripted session', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    const c = 'O-01-45'
    log.logEncounter(c)
    log.rate(c, 'u', 3)
    log.rate(c, 'd', 2)
    log.rate(c, 'm', 1)
    log.rate(c, 'd', 2)
    log.rate(c, 'd', 4)
    log.toggleFan(c)
    log.cycleWork(c, 'insight')
    log.cycleWork(c, 'instinct')
    log.cycleWork(c, 'instinct')
    log.cycleWork(c, 'insight')
    log.cycleWork(c, 'insight')
    log.cycleWork(c, 'insight')
    log.adjustLost(c, 1)
    log.adjustLost(c, 1)
    log.adjustLost(c, 1)
    log.adjustLost(c, -1)
    log.setNote(c, "Doc's \"note\"\n")
    vi.setSystemTime(2000)
    log.logEncounter('T-03-46')
    log.logEncounter(c)
    log.setShield(false)
    vi.setSystemTime(3000)
    log.logEncounter('O-03-03')
    log.removeEntry('O-03-03')
    const expected =
      '{"v":1,"shield":false,"entries":{"O-01-45":{"met":1000,"a":{"u":3,"d":4,"m":1},"fan":true,' +
      '"w":{"instinct":-1,"insight":1},"lost":2,"note":"Doc\'s \\"note\\"\\n","scraps":[]},' +
      '"T-03-46":{"met":2000,"a":{"u":0,"d":0,"m":0},"fan":false,"w":{},"lost":0,"note":"","scraps":[]}}}'
    expect(storage.last).toBe(expected)
    expect(log.exportBackup()).toBe(expected)
  })

  it('keeps r when persisting a loaded entry', () => {
    const initial = normalize({ entries: { 'O-01-45': { met: 9, r: { old: 2 } } } })
    const storage = new MemoryStorage(initial)
    const log = createContainmentLog(storage)
    log.toggleFan('O-01-45')
    expect(storage.last).toBe(
      '{"v":1,"shield":true,"entries":{"O-01-45":{"met":9,"a":{"u":0,"d":0,"m":0},"fan":true,"w":{},"lost":0,"note":"","scraps":[],"r":{"old":2}}}}',
    )
  })

  it('flips storageOk when a save fails, and never back', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    expect(log.storageOk.value).toBe(true)
    storage.failSaves = true
    log.setShield(false)
    expect(log.storageOk.value).toBe(false)
    expect(log.state.shield).toBe(false)
    storage.failSaves = false
    log.setShield(true)
    expect(log.storageOk.value).toBe(false)
  })

  it('starts with storageOk false when the load failed', () => {
    const log = createContainmentLog(new MemoryStorage(blankState(), false))
    expect(log.storageOk.value).toBe(false)
  })

  it('summarises logged units by risk, roster order within a risk', () => {
    const log = createContainmentLog(new MemoryStorage())
    for (const code of ['T-03-46', 'O-01-45', 'O-03-03', 'F-01-02']) log.logEncounter(code)
    log.adjustLost('T-03-46', 3)
    log.adjustLost('O-01-45', 1)
    log.toggleFan('O-03-03')
    const s = log.summary.value
    expect(s.logged.map((a) => a.code)).toEqual(['O-03-03', 'O-01-45', 'F-01-02', 'T-03-46'])
    expect(s.lost).toBe(4)
    expect(s.fans).toBe(1)
  })

  it('is reactive for readers', () => {
    const log = createContainmentLog(new MemoryStorage())
    const seen: number[] = []
    const stop = watchEffect(() => seen.push(log.summary.value.logged.length), { flush: 'sync' })
    log.logEncounter('O-01-45')
    log.removeEntry('O-01-45')
    stop()
    expect(seen).toEqual([0, 1, 0])
  })

  describe('restoreBackup', () => {
    it('rejects empty, non-JSON and non-backup text without touching the log', () => {
      const storage = new MemoryStorage()
      const log = createContainmentLog(storage)
      log.logEncounter('O-01-45')
      const before = log.exportBackup()
      expect(log.restoreBackup('   ')).toEqual({ ok: false, reason: 'empty' })
      expect(log.restoreBackup('{oops')).toEqual({ ok: false, reason: 'not-json' })
      for (const raw of ['null', '3', '"x"', '{}', '{"entries":"x"}', '[]', 'true']) {
        expect(log.restoreBackup(raw), raw).toEqual({ ok: false, reason: 'not-backup' })
      }
      expect(log.exportBackup()).toBe(before)
      expect(storage.saved).toHaveLength(1)
    })

    it('accepts null entries, as the legacy check does', () => {
      const log = createContainmentLog(new MemoryStorage())
      log.logEncounter('O-01-45')
      expect(log.restoreBackup('{"entries":null,"shield":false}')).toEqual({ ok: true, count: 0 })
      expect(log.exportBackup()).toBe('{"v":1,"shield":false,"entries":{}}')
    })

    it('replaces the log with the normalized backup and persists', () => {
      const storage = new MemoryStorage()
      const log = createContainmentLog(storage)
      log.logEncounter('T-03-46')
      const result = log.restoreBackup(
        '  {"shield":false,"entries":{"O-01-45":{"met":7,"lost":2},"bogus":{"met":1},"O-03-03":{"met":8}}}\n',
      )
      expect(result).toEqual({ ok: true, count: 2 })
      expect(Object.keys(log.state.entries)).toEqual(['O-01-45', 'O-03-03'])
      expect(log.state.shield).toBe(false)
      expect(storage.last).toBe(log.exportBackup())
      expect(storage.last!.startsWith('{"v":1,"shield":false,"entries":{"O-01-45":{"met":7,')).toBe(true)
    })
  })

  it('erases every entry and keeps the shield', () => {
    const storage = new MemoryStorage()
    const log = createContainmentLog(storage)
    log.setShield(false)
    log.logEncounter('O-01-45')
    log.eraseAll()
    expect(storage.last).toBe('{"v":1,"shield":false,"entries":{}}')
    expect(log.summary.value.logged).toEqual([])
  })
})
