<script setup lang="ts">
import { WORKS } from '@/domain/catalog'
import type { EntryView, WorkKey } from '@/domain/types'

defineProps<{
  results: EntryView['w']
}>()

defineEmits<{
  cycle: [work: WorkKey]
}>()

function label(result: 1 | -1 | undefined): string {
  return result === 1 ? 'goes well' : result === -1 ? 'avoid' : 'unknown'
}
</script>

<template>
  <section class="sec">
    <h3>Work results</h3>
    <div class="works">
      <button
        v-for="w in WORKS"
        :key="w.key"
        type="button"
        class="work"
        :class="{ good: results[w.key] === 1, bad: results[w.key] === -1 }"
        :style.attr="'--w:' + w.color"
        @click="$emit('cycle', w.key)"
      >
        <b>{{ w.label }}</b><em>{{ label(results[w.key]) }}</em>
      </button>
    </div>
    <p class="hint" style="margin-top:8px">Tap a work type to switch between goes well, avoid, and unknown.</p>
  </section>
</template>

<style scoped lang="scss">
.works {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.work {
  display: grid;
  gap: 1px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--line);
  border-left: 5px solid var(--w);
  text-align: left;
}

.work b {
  font-weight: 600;
}

.work em {
  font-style: normal;
  font-size: .85rem;
  color: var(--dust);
}

.work.good {
  background: color-mix(in srgb, var(--w) 22%, transparent);
  border-color: var(--w);
}

.work.good em {
  color: var(--bone);
}

.work.bad b {
  text-decoration: line-through;
  color: var(--dust);
}

.work.bad em {
  color: #ff8080;
}
</style>
