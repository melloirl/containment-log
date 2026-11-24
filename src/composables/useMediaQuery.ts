import { getCurrentScope, onScopeDispose, readonly, ref } from 'vue'
import type { Ref } from 'vue'

/** Below the desktop breakpoint: the file opens as a full-screen sheet. Keep in step with $desktop in _mixins.scss. */
export const COMPACT_QUERY = '(max-width:999px)'

/** Reactive `matchMedia(query).matches`. Stops listening when the calling scope is disposed. */
export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  // No matchMedia (node, tests): a query that never matches.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return readonly(ref(false))
  }
  const list = window.matchMedia(query)
  const matches = ref(list.matches)
  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }
  list.addEventListener('change', onChange)
  if (getCurrentScope()) {
    onScopeDispose(() => list.removeEventListener('change', onChange))
  }
  return readonly(matches)
}

export function useIsCompact(): Readonly<Ref<boolean>> {
  return useMediaQuery(COMPACT_QUERY)
}
