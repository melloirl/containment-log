<script setup lang="ts">
// Container. Binds useLogBrowser(): query, filter, loggedOnly, units.
// Renders .controls: the search input, FilterChips, and the live .count line.
import { onMounted, useTemplateRef, watch } from 'vue'
import { countLabel } from '@/domain/roster'
import { useLogBrowser } from '@/composables/useLogBrowser'
import FilterChips from './FilterChips.vue'

const { query, filter, loggedOnly, units } = useLogBrowser()

// Plain input event, as in legacy (v-model would hold back IME composition).
function onInput(ev: Event): void {
  query.value = (ev.target as HTMLInputElement).value
}

// The value goes on the DOM property only: a :value binding would also write a
// value attribute, which the legacy markup does not have.
const search = useTemplateRef<HTMLInputElement>('search')
function syncSearch(): void {
  if (search.value && search.value.value !== query.value) search.value.value = query.value
}
onMounted(syncSearch)
watch(query, syncSearch)
</script>

<template>
  <div class="controls">
    <input
      ref="search"
      class="search"
      type="search"
      placeholder="Search by code or name"
      aria-label="Search by code or name"
      autocomplete="off"
      @input="onInput"
    >
    <FilterChips v-model:filter="filter" v-model:logged-only="loggedOnly" />
    <p class="count" aria-live="polite">{{ countLabel(units.length) }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.controls {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.search {
  width: 100%;
  padding: 11px 14px;
  background: #000;
  border: 1px solid var(--line);
  color: var(--bone);
  border-radius: 0;
}

.search::placeholder {
  color: var(--dust);
}

.search:focus {
  border-color: var(--amber);
  outline: none;
}

.count {
  color: var(--dust);
  font-size: .9rem;
}

@include desktop {
  .controls {
    grid-template-columns: 320px 1fr;
    align-items: center;
  }

  .count {
    grid-column: 1/-1;
  }
}
</style>
