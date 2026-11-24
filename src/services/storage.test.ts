import { afterEach, describe, expect, it } from 'vitest'
import { blankState } from '@/domain/log-state'
import { STORAGE_KEY, createLocalLogStorage } from './storage'

class FakeLocalStorage {
  map = new Map<string, string>()
  calls: string[] = []
  failWrites = false
  getItem(k: string) {
    this.calls.push('get:' + k)
    return this.map.has(k) ? this.map.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.calls.push('set:' + k)
    if (this.failWrites) throw new Error('QuotaExceededError')
    this.map.set(k, String(v))
  }
  removeItem(k: string) {
    this.calls.push('remove:' + k)
    this.map.delete(k)
  }
}

function install(): FakeLocalStorage {
  const fake = new FakeLocalStorage()
  ;(globalThis as { localStorage?: unknown }).localStorage = fake
  return fake
}

afterEach(() => {
  delete (globalThis as { localStorage?: unknown }).localStorage
})

describe('createLocalLogStorage', () => {
  it('uses the legacy key', () => {
    expect(STORAGE_KEY).toBe('containment-log-v1')
  })

  it('probes, then loads and normalizes what is stored', () => {
    const fake = install()
    fake.map.set(STORAGE_KEY, '{"shield":false,"entries":{"O-01-45":{"met":5},"nope":{"met":1}}}')
    const { state, ok } = createLocalLogStorage().load()
    expect(ok).toBe(true)
    expect(Object.keys(state.entries)).toEqual(['O-01-45'])
    expect(state.shield).toBe(false)
    expect(fake.calls).toEqual([
      'set:containment-log-v1-probe',
      'remove:containment-log-v1-probe',
      'get:containment-log-v1',
    ])
    expect(fake.map.has(STORAGE_KEY + '-probe')).toBe(false)
  })

  it('returns a blank log when nothing is stored', () => {
    install()
    expect(createLocalLogStorage().load()).toEqual({ state: blankState(), ok: true })
  })

  it('treats a failed probe as a storage failure', () => {
    install().failWrites = true
    expect(createLocalLogStorage().load()).toEqual({ state: blankState(), ok: false })
  })

  it('treats unparseable stored text as a storage failure, like the legacy app', () => {
    install().map.set(STORAGE_KEY, '{oops')
    expect(createLocalLogStorage().load()).toEqual({ state: blankState(), ok: false })
  })

  it('treats a missing localStorage as a storage failure', () => {
    expect(createLocalLogStorage().load()).toEqual({ state: blankState(), ok: false })
  })

  it('saves JSON.stringify of the state and reports refusals', () => {
    const fake = install()
    const storage = createLocalLogStorage()
    const state = { ...blankState(), shield: false }
    expect(storage.save(state)).toBe(true)
    expect(fake.map.get(STORAGE_KEY)).toBe('{"v":1,"shield":false,"entries":{}}')
    fake.failWrites = true
    expect(storage.save(state)).toBe(false)
  })
})
