<script setup lang="ts">
// Container. Renders header.top: the title, the tagline, the gauge and the totals.
import { CATALOG } from '@/domain/catalog'
import { useContainmentLog } from '@/composables/useContainmentLog'
import ContainmentGauge from './ContainmentGauge.vue'
import LogStats from './LogStats.vue'

const { summary } = useContainmentLog()
const total = CATALOG.length
</script>

<template>
  <header class="top">
    <h1>{{ $t('app.title') }}</h1>
    <p class="sub">{{ $t('app.tagline') }}</p>
    <ContainmentGauge :logged="summary.logged" :total="total" />
    <LogStats
      :logged="summary.logged.length"
      :total="total"
      :lost="summary.lost"
      :fans="summary.fans"
    />
  </header>
</template>

<style scoped lang="scss">
.top h1 {
  font: 700 #{'clamp(2.6rem,11vw,5rem)/.92'} var(--display);
  text-transform: uppercase;
  letter-spacing: .01em;
  color: var(--amber);
}

.top .sub {
  color: var(--dust);
  margin-top: 8px;
  max-width: 46ch;
}
</style>
