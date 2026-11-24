import { inject } from 'vue'
import type { Component, InjectionKey } from 'vue'

/**
 * The editing interface. It is provided only in author mode (see src/main.ts
 * and src/author), so in the published guide this is always null and none of
 * the editor is in the bundle.
 */
export interface AuthorTools {
  /** Edits one abnormality's entry and note. Takes an `abnormality` prop. */
  readonly EntryEditor: Component
  /** Save state and the publish button. */
  readonly PublishBar: Component
}

export const authorToolsKey: InjectionKey<AuthorTools> = Symbol('author tools')

export function useAuthorTools(): AuthorTools | null {
  return inject(authorToolsKey, null)
}
