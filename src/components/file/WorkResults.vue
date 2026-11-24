<script setup lang="ts">
import { WORKS } from '@/domain/catalog'
import type { Entry } from '@/domain/types'

defineProps<{
  results: NonNullable<Entry['works']>
}>()
</script>

<template>
  <section class="sec">
    <h3>{{ $t('works.title') }}</h3>
    <div class="works">
      <div
        v-for="w in WORKS"
        :key="w.key"
        class="work"
        :class="results[w.key]"
        :style="'--w:' + w.color"
      >
        <b>{{ $t('works.' + w.key) }}</b><em>{{ $t('works.result.' + (results[w.key] ?? 'unknown')) }}</em>
      </div>
    </div>
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
  border: 1px solid var(--line);
  border-left: 5px solid var(--w);
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
