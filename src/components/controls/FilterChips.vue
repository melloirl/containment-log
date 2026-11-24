<script setup lang="ts">
import { RISKS } from '@/domain/catalog'
import type { RosterFilter } from '@/domain/types'

const filter = defineModel<RosterFilter>('filter', { required: true })
const loggedOnly = defineModel<boolean>('loggedOnly', { required: true })

/** Risk chips carry the in-game level name, which is the same in every language. */
const riskChips = RISKS.map((r, i) => ({
  value: String(i) as RosterFilter,
  label: r.key,
  style: '--c:' + r.color,
}))
</script>

<template>
  <div class="chips" role="group" :aria-label="$t('controls.filters')">
    <button type="button" class="chip" :aria-pressed="filter === 'all'" @click="filter = 'all'">
      <span>{{ $t('controls.all') }}</span>
    </button>
    <button
      v-for="chip in riskChips"
      :key="chip.value"
      type="button"
      class="chip"
      :aria-pressed="filter === chip.value"
      :style="chip.style"
      @click="filter = chip.value"
    >
      <span>{{ chip.label }}</span>
    </button>
    <button type="button" class="chip" :aria-pressed="filter === 'tools'" @click="filter = 'tools'">
      <span>{{ $t('controls.tools') }}</span>
    </button>
    <button type="button" class="chip gap" :aria-pressed="loggedOnly" @click="loggedOnly = !loggedOnly">
      <span>{{ $t('controls.loggedOnly') }}</span>
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
