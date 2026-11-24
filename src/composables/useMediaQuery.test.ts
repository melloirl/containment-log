import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useIsCompact, useMediaQuery } from './useMediaQuery'

afterEach(() => {
  vi.unstubAllGlobals()
})

function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const list = {
    matches: initial,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.delete(fn),
  }
  const matchMedia = vi.fn(() => list)
  vi.stubGlobal('window', { matchMedia })
  return {
    matchMedia,
    listeners,
    fire(matches: boolean) {
      for (const fn of listeners) fn({ matches })
    },
  }
}

describe('useMediaQuery', () => {
  it('is a constant false without matchMedia', () => {
    expect(useMediaQuery('(max-width:999px)').value).toBe(false)
    expect(useIsCompact().value).toBe(false)
  })

  it('follows the media query and stops listening when its scope is disposed', () => {
    const mm = fakeMatchMedia(true)
    const scope = effectScope()
    const compact = scope.run(() => useIsCompact())!
    expect(mm.matchMedia).toHaveBeenCalledWith('(max-width:999px)')
    expect(compact.value).toBe(true)
    mm.fire(false)
    expect(compact.value).toBe(false)
    scope.stop()
    expect(mm.listeners.size).toBe(0)
  })
})
