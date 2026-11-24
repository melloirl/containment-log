<script setup lang="ts">
// details.settings. The spoiler shield is the one setting, and it lasts for the visit.
import { useContainmentLog } from '@/composables/useContainmentLog'
import SpoilerShieldToggle from './SpoilerShieldToggle.vue'

const { shield } = useContainmentLog()
</script>

<template>
  <details class="settings">
    <summary>{{ $t('settings.title') }}</summary>
    <div class="box">
      <SpoilerShieldToggle v-model="shield" />
    </div>
  </details>
</template>

<style scoped lang="scss">
.settings {
  margin-top: 44px;
  border-top: 1px solid var(--line);
  padding-top: 14px;
}

.settings summary {
  cursor: pointer;
  font: 600 1.1rem/1.4 var(--display);
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--amber);
}

.settings .box {
  margin-top: 14px;
  display: grid;
  gap: 18px;
  max-width: 640px;
}
</style>
