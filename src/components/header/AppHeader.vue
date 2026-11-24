<script setup lang="ts">
// Container. Reads useContainmentLog(): summary and storageOk.
// Renders header.top: h1, .sub, ContainmentGauge, LogStats, and the .warn storage notice.
import { ABNORMALITIES } from '@/domain/catalog'
import { useContainmentLog } from '@/composables/useContainmentLog'
import ContainmentGauge from './ContainmentGauge.vue'
import LogStats from './LogStats.vue'

const { summary, storageOk } = useContainmentLog()
const total = ABNORMALITIES.length
</script>

<template>
  <header class="top">
    <h1>Containment log</h1>
    <p class="sub">Your field guide to every abnormality you've met: how useful it is, how dangerous, and how much babysitting it needs.</p>
    <ContainmentGauge :logged="summary.logged" :total="total" />
    <LogStats
      :logged="summary.logged.length"
      :total="total"
      :lost="summary.lost"
      :fans="summary.fans"
    />
    <p v-if="!storageOk" class="warn">This browser is blocking local storage, so nothing will be saved after you close the page. Copy a backup from Settings before you leave.</p>
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

.warn {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #ff4040;
  color: #ffb4b4;
  background: #2a0d0d;
}
</style>
