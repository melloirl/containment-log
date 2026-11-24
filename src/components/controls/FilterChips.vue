<script setup lang="ts">
import { RISKS } from '@/domain/catalog'
import type { RosterFilter } from '@/domain/types'

const filter = defineModel<RosterFilter>('filter', { required: true })
const loggedOnly = defineModel<boolean>('loggedOnly', { required: true })

/** Value, label, and the legacy inline style text (null when the chip has no colour). */
const chips: readonly { value: RosterFilter; label: string; style: string | null }[] = [
  { value: 'all', label: 'All', style: null },
  ...RISKS.map((r, i) => ({
    value: String(i) as RosterFilter,
    label: r.key,
    style: '--c:' + r.color,
  })),
  { value: 'tools', label: 'Tools', style: null },
]
</script>

<template>
  <div class="chips" role="group" aria-label="Filters">
    <button
      v-for="chip in chips"
      :key="chip.value"
      type="button"
      class="chip"
      :aria-pressed="filter === chip.value"
      :style.attr="chip.style ?? undefined"
      @click="filter = chip.value"
    >
      <span>{{ chip.label }}</span>
    </button>
    <button
      type="button"
      class="chip gap"
      :aria-pressed="loggedOnly"
      @click="loggedOnly = !loggedOnly"
    >
      <span>Logged only</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 6px 6px;
  scrollbar-width: none;
}

.chips::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: none;
  transform: skewX(-14deg);
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--bone);
  font: 600 1rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.chip > span {
  display: block;
  transform: skewX(14deg);
}

.chip[aria-pressed="true"] {
  background: var(--c, var(--amber));
  border-color: var(--c, var(--amber));
  color: #000;
}

.chip.gap {
  margin-left: 10px;
}
</style>
