import type { App } from 'vue'
import { authorToolsKey } from '@/composables/useAuthorTools'
import { readLogFrom } from '@/composables/useContainmentLog'
import EntryEditor from './EntryEditor.vue'
import PublishBar from './PublishBar.vue'
import { useDraft } from './useDraft'

/**
 * Turns the guide into its own editor: the page reads the author's draft, and
 * the file panel and the page gain editing controls. Call before mounting.
 */
export function installAuthoring(app: App): void {
  const draft = useDraft()
  readLogFrom(draft.source)
  app.provide(authorToolsKey, { EntryEditor, PublishBar })
  // A save still waiting on its delay goes out as the tab closes.
  window.addEventListener('pagehide', () => void draft.flush())
}
