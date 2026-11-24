<script setup lang="ts">
// Container. Renders aside.file: the empty hint, or the open abnormality's file.
// Owns the sheet behaviour: .open, html.locked on compact screens, Escape, scroll reset, and focus hand-offs.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import AgentsLost from './AgentsLost.vue'
import FileHeader from './FileHeader.vue'
import FileNotes from './FileNotes.vue'
import PerformanceReview from './PerformanceReview.vue'
import WorkResults from './WorkResults.vue'
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'
import { useIsCompact } from '@/composables/useMediaQuery'
import { formatDay } from '@/domain/format'

const log = useContainmentLog()
const { selected, selectCount, close } = useLogBrowser()
const isCompact = useIsCompact()

const entry = computed(() => (selected.value ? log.entry(selected.value.code) : undefined))
const note = computed(() => (selected.value && entry.value ? log.note(selected.value.code) : undefined))
const sealed = computed(() => !entry.value && log.shield.value)

const asideEl = ref<HTMLElement | null>(null)
const header = ref<InstanceType<typeof FileHeader> | null>(null)

// The file is a full-screen sheet on compact screens: lock the page behind it.
watchEffect(() => {
  document.documentElement.classList.toggle('locked', !!selected.value && isCompact.value)
})
onBeforeUnmount(() => document.documentElement.classList.remove('locked'))

// The reader opened a tile (possibly the one already open): start at the top, and
// on a sheet move focus into it.
watch(
  selectCount,
  () => {
    if (asideEl.value) asideEl.value.scrollTop = 0
    if (isCompact.value) header.value?.focusName()
  },
  { flush: 'post' },
)

async function closeFile(): Promise<void> {
  const code = close()
  await nextTick()
  if (code) document.querySelector<HTMLElement>('.unit[data-code="' + CSS.escape(code) + '"]')?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && selected.value && isCompact.value) void closeFile()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <aside ref="asideEl" class="file" :class="{ open: !!selected }" :aria-label="$t('file.label')">
    <p v-if="!selected" class="file-empty">{{ $t('file.empty') }}</p>
    <template v-else>
      <div class="file-bar">
        <button type="button" class="linkish" @click="closeFile">{{ $t('file.back') }}</button>
      </div>
      <div class="file-body">
        <FileHeader ref="header" :abnormality="selected" :sealed="sealed" :logged="!!entry" />
        <div v-if="!entry" class="sec">
          <p>{{ $t(sealed ? 'file.sealed' : 'file.unlogged') }}</p>
        </div>
        <template v-else>
          <p class="file-status">{{ $t('file.loggedOn', { date: formatDay(entry.logged, $i18n.locale) }) }}</p>
          <FileNotes v-if="note" :note="note" :name="selected.name" />
          <PerformanceReview :entry="entry" />
          <WorkResults v-if="!selected.tool" :results="entry.works ?? {}" />
          <AgentsLost :lost="entry.agentsLost ?? 0" />
        </template>
      </div>
    </template>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.file {
  @include containment-scrollbar;
}

.file {
  display: none;
}

.file.open {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 10;
  overflow-y: auto;
  background: var(--ink);
}

.file-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--ink);
  border-bottom: 1px solid var(--line);
  padding: 8px 12px;
}

.file-body {
  padding: 0 16px 40px;
}

.file-empty {
  padding: 28px 20px;
  color: var(--dust);
}

.file-status {
  margin-top: 16px;
  color: var(--dust);
}

// After the base rules, so it overrides both.
@include desktop {
  .file,
  .file.open {
    display: block;
    position: sticky;
    top: 16px;
    inset: auto;
    z-index: auto;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    border: 1px solid var(--line);
    background: var(--ink);
  }

  .file-bar {
    display: none;
  }
}
</style>
