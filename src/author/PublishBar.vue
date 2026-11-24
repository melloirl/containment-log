<script setup lang="ts">
// Author mode only. A bar along the bottom of the page: whether the edits are
// on disk, what differs from the last commit, and the button that publishes.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useContainmentLog } from '@/composables/useContainmentLog'
import type { Change } from './protocol'
import { useDraft } from './useDraft'

const draft = useDraft()
const log = useContainmentLog()

const changes = computed(() => draft.status.value?.changes ?? [])
const unpushed = computed(() => draft.status.value?.unpushed ?? 0)
const branch = computed(() => draft.status.value?.branch ?? '')

const VERB: Record<Change['kind'], string> = { added: 'Log', updated: 'Update', removed: 'Remove' }

/** "Log Punishing Bird and Theresia; update One Sin and Hundreds of Good Deeds" */
function describe(list: readonly Change[]): string {
  const parts: string[] = []
  for (const kind of ['added', 'updated', 'removed'] as const) {
    const names = list.filter((c) => c.kind === kind).map((c) => log.byCode(c.code)?.name ?? c.code)
    if (!names.length) continue
    const listed = names.length > 3 ? `${names.length} abnormalities` : names.join(', ').replace(/, ([^,]*)$/, ' and $1')
    parts.push(`${parts.length ? VERB[kind].toLowerCase() : VERB[kind]} ${listed}`)
  }
  return parts.join('; ')
}

// The message follows the changes until the author types their own.
const message = ref('')
const typed = ref(false)
watch(changes, (list) => {
  if (!typed.value) message.value = describe(list)
})

const publishing = ref(false)
const published = ref<string | null>(null)
const canPublish = computed(
  () => !publishing.value && draft.saving.value !== 'failed' && (changes.value.length > 0 || unpushed.value > 0),
)

async function publish(): Promise<void> {
  publishing.value = true
  published.value = null
  try {
    const result = await draft.publish(message.value.trim() || describe(changes.value))
    published.value = result.commit
    typed.value = false
    message.value = ''
  } catch {
    // draft.error has the reason, and the bar shows it.
  } finally {
    publishing.value = false
  }
}

// The file panel stops above the bar: it reads the bar's height from --author-bar.
const bar = ref<HTMLElement | null>(null)
const page = document.documentElement
const sizes = new ResizeObserver(() => page.style.setProperty('--author-bar', `${bar.value?.offsetHeight ?? 0}px`))
onMounted(() => bar.value && sizes.observe(bar.value))
onBeforeUnmount(() => {
  sizes.disconnect()
  page.style.removeProperty('--author-bar')
})

const state = computed(() => {
  if (draft.error.value) return draft.error.value
  if (draft.saving.value === 'pending') return 'Saving…'
  if (changes.value.length) {
    return changes.value.length === 1 ? '1 change not published' : `${changes.value.length} changes not published`
  }
  if (unpushed.value) return unpushed.value === 1 ? '1 commit not pushed' : `${unpushed.value} commits not pushed`
  if (published.value) return `Published ${published.value}. The site updates in about a minute.`
  return 'Nothing to publish'
})
</script>

<template>
  <form ref="bar" class="bar" :class="{ failed: !!draft.error.value }" @submit.prevent="publish">
    <strong>Author mode</strong>
    <span class="state" role="status">{{ state }}</span>
    <a
      v-if="published && draft.status.value?.repo && !changes.length"
      :href="draft.status.value.repo + '/actions'"
      target="_blank"
      rel="noopener"
    >Watch the deploy</a>
    <span v-if="branch && branch !== 'main'" class="warn">On branch {{ branch }}: only main deploys.</span>
    <input
      v-if="changes.length"
      v-model="message"
      type="text"
      aria-label="Commit message"
      @input="typed = true"
    >
    <button type="submit" :disabled="!canPublish">{{ publishing ? 'Publishing…' : 'Publish' }}</button>
  </form>
</template>

<style scoped lang="scss">
.bar {
  position: sticky;
  bottom: 0;
  // Above the file sheet on small screens.
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  padding: 8px 16px;
  border-top: 1px dashed var(--amber);
  background: #000;
  font-size: .9rem;
}

strong {
  font: 600 .95rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--amber);
}

.state {
  color: var(--dust);
  white-space: pre-wrap;
}

.failed .state,
.warn {
  color: var(--danger);
}

a {
  color: var(--amber);
}

input {
  flex: 1 1 240px;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid var(--line);
  background: var(--ink);
  color: var(--bone);
  font: inherit;
}

button {
  margin-left: auto;
  padding: 7px 18px;
  border: 1px solid var(--amber);
  background: var(--amber);
  color: #000;
  font: 600 .95rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .08em;
}

button:disabled {
  background: none;
  border-color: var(--line);
  color: var(--dust);
}

input:focus-visible,
button:focus-visible {
  outline: 2px solid var(--amber);
  outline-offset: 1px;
}
</style>
