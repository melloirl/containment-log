<script setup lang="ts">
import type { Verdict } from '@/domain/types'

defineProps<{
  /** null until all three axes are rated. */
  verdict: Verdict | null
}>()
</script>

<template>
  <div class="verdict" :class="{ pending: !verdict }">
    <span class="score">{{ verdict ? verdict.score : '–' }}</span>
    <span class="call">{{ $t('verdict.' + (verdict?.tier ?? 'pending') + '.call') }}</span>
    <span class="why">{{ $t('verdict.' + (verdict?.tier ?? 'pending') + '.why') }}</span>
  </div>
</template>

<style scoped lang="scss">
.verdict {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0 14px;
  align-items: center;
  margin-top: 18px;
  padding: 12px 14px;
  background: var(--cell);
  border-left: 5px solid var(--amber);
}

.verdict .score {
  grid-row: #{'1/3'};
  min-width: 2ch;
  text-align: center;
  font: 700 2.7rem/1 var(--display);
  color: var(--amber);
}

.verdict .call {
  font: 700 1.3rem/1.15 var(--display);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.verdict .why {
  color: var(--dust);
  font-size: .9rem;
}

.verdict.pending {
  border-left-color: var(--line);
}

.verdict.pending .score {
  color: #5a4a2c;
}

.verdict.pending .call {
  color: var(--dust);
}
</style>
