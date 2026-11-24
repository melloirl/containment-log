<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import AgentsLost from './AgentsLost.vue'
import FileHeader from './FileHeader.vue'
import FileNotes from './FileNotes.vue'
import FileStatus from './FileStatus.vue'
import FileUnlogged from './FileUnlogged.vue'
import PerformanceReview from './PerformanceReview.vue'
import WorkResults from './WorkResults.vue'
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'
import { useIsCompact } from '@/composables/useMediaQuery'

const log = useContainmentLog()
const { selected, selectCount, confirmingRemoval, close, markFresh, clearFresh } = useLogBrowser()
const isCompact = useIsCompact()

const entry = computed(() => (selected.value ? log.entry(selected.value.code) : undefined))
const sealed = computed(() => !entry.value && log.state.shield)

// The name wipe. Legacy keeps `declass` on the h2 until the file next re-renders
// (any file action but typing a note, opening or closing a file, the shield,
// restore, erase), and while it stays the finished wipe's clip-path keeps
// clipping the h2. The tile's freshCode also ends on a search or a filter, which
// leave the file alone, so the file tracks its own flag. Everything that ends the
// wipe ends the tile's flag too.
const wipeCode = ref<string | null>(null)
const endWipe = () => {
  wipeCode.value = null
  clearFresh()
}
watch([confirmingRemoval, () => log.state.shield, () => log.state.entries], endWipe)

const asideEl = ref<HTMLElement | null>(null)
const header = ref<InstanceType<typeof FileHeader> | null>(null)

// The file is a full-screen sheet on compact screens: lock the page behind it.
watchEffect(() => {
  document.documentElement.classList.toggle('locked', !!selected.value && isCompact.value)
})
onBeforeUnmount(() => document.documentElement.classList.remove('locked'))

// The user opened a tile (possibly the one already open): start at the top, and
// on a sheet move focus into it.
watch(
  selectCount,
  () => {
    endWipe()
    if (asideEl.value) asideEl.value.scrollTop = 0
    if (isCompact.value) header.value?.focusName({})
  },
  { flush: 'post' },
)

async function closeFile(): Promise<void> {
  endWipe()
  const code = close()
  await nextTick()
  if (code) document.querySelector<HTMLElement>('.unit[data-code="' + CSS.escape(code) + '"]')?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && selected.value && isCompact.value) void closeFile()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

async function focusNameAfterUpdate(): Promise<void> {
  await nextTick()
  header.value?.focusName()
}

function onLog(code: string): void {
  log.logEncounter(code)
  markFresh(code)
  wipeCode.value = code
  void focusNameAfterUpdate()
}

function onRemove(code: string): void {
  endWipe()
  log.removeEntry(code)
  confirmingRemoval.value = false
  void focusNameAfterUpdate()
}

/** Runs a file action; like the legacy re-render that followed each one, it ends the wipe. */
function act(change: (code: string) => void): void {
  if (!selected.value) return
  endWipe()
  change(selected.value.code)
}
</script>

<template>
  <aside ref="asideEl" class="file" :class="{ open: !!selected }" aria-label="Abnormality file">
    <p v-if="!selected" class="file-empty">Open a containment unit to read its file and review it.</p>
    <template v-else>
      <div class="file-bar">
        <button type="button" class="linkish" @click="closeFile">Back to the log</button>
      </div>
      <div class="file-body">
        <FileHeader
          ref="header"
          :abnormality="selected"
          :sealed="sealed"
          :logged="!!entry"
          :fresh="wipeCode === selected.code"
        />
        <FileUnlogged v-if="!entry" :sealed="sealed" @log="onLog(selected.code)" />
        <template v-else>
          <FileStatus v-model:confirming="confirmingRemoval" :met="entry.met" @remove="onRemove(selected.code)" />
          <FileNotes
            :model-value="entry.note"
            :name="selected.name"
            @update:model-value="log.setNote(selected.code, $event)"
          />
          <!-- Keyed by code so another abnormality's file starts without a peeked label. -->
          <PerformanceReview
            :key="selected.code"
            :entry="entry"
            @rate="(axis, level) => act((code) => log.rate(code, axis, level))"
            @toggle-fan="act(log.toggleFan)"
          />
          <WorkResults
            v-if="!selected.tool"
            :results="entry.w"
            @cycle="(work) => act((code) => log.cycleWork(code, work))"
          />
          <AgentsLost :lost="entry.lost" @adjust="(delta) => act((code) => log.adjustLost(code, delta))" />
        </template>
      </div>
    </template>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

// The `.file` half of the legacy `html, .file` scrollbar rules.
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

// After the base rules, so it overrides both exactly as the legacy media block did.
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
