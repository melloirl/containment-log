<script setup lang="ts">
// Container. Renders the .grid of UnitTile (or the .empty message) and the .note about the spoiler shield.
import { computed } from 'vue'
import { emptyReason, isRiskFilter } from '@/domain/roster'
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'
import UnitTile from './UnitTile.vue'

const log = useContainmentLog()
const { query, filter, loggedOnly, units, selectedCode, select } = useLogBrowser()

const empty = computed(() =>
  emptyReason({ q: query.value, filter: filter.value, loggedOnly: loggedOnly.value }),
)
const showNote = computed(() => isRiskFilter(filter.value) && log.shield.value)
</script>

<template>
  <div class="grid">
    <template v-if="units.length">
      <UnitTile
        v-for="unit in units"
        :key="unit.abnormality.code"
        :unit="unit"
        :entry="log.entry(unit.abnormality.code)"
        :selected="selectedCode === unit.abnormality.code"
        @open="select(unit.abnormality.code)"
      />
    </template>
    <p v-else class="empty">{{ $t('grid.empty.' + empty) }}</p>
  </div>
  <p v-if="showNote" class="note">{{ $t('grid.shieldNote') }}</p>
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
