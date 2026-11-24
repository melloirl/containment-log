<script setup lang="ts">
// Container. Reads useLogBrowser() and useContainmentLog().
// Renders the .grid of UnitTile (or the .empty message) and the .note about the spoiler shield.
import { computed } from 'vue'
import { emptyMessage, isRiskFilter } from '@/domain/roster'
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'
import UnitTile from './UnitTile.vue'

const log = useContainmentLog()
const { query, filter, loggedOnly, units, selectedCode, freshCode, select } = useLogBrowser()

const empty = computed(() =>
  emptyMessage({ q: query.value, filter: filter.value, loggedOnly: loggedOnly.value }),
)
const showNote = computed(() => isRiskFilter(filter.value) && log.state.shield)
</script>

<template>
  <div class="grid">
    <template v-if="units.length">
      <UnitTile
        v-for="unit in units"
        :key="unit.abnormality.code"
        :unit="unit"
        :entry="log.state.entries[unit.abnormality.code]"
        :selected="selectedCode === unit.abnormality.code"
        :fresh="freshCode === unit.abnormality.code"
        @open="select(unit.abnormality.code)"
      />
    </template>
    <p v-else class="empty">{{ empty }}</p>
  </div>
  <p v-if="showNote" class="note">Unidentified units stay hidden while you filter by risk level. Turn off the spoiler shield in Settings to see the full roster.</p>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
  gap: 10px;
}

.empty {
  grid-column: 1/-1;
  padding: 28px 16px;
  border: 1px dashed var(--line);
  color: var(--dust);
}

.note {
  color: var(--dust);
  font-size: .9rem;
  margin-top: 10px;
}
</style>
