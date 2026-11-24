<script setup lang="ts">
// Shell: details.settings with its summary and .box. Composes SpoilerShieldToggle, BackupTools, EraseLog.
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'
import BackupTools from './BackupTools.vue'
import EraseLog from './EraseLog.vue'
import SpoilerShieldToggle from './SpoilerShieldToggle.vue'

const log = useContainmentLog()
const browser = useLogBrowser()

function erase(): void {
  log.eraseAll()
  browser.close()
}
</script>

<template>
  <details class="settings">
    <summary>Settings and backup</summary>
    <div class="box">
      <SpoilerShieldToggle :model-value="log.state.shield" @update:model-value="log.setShield" />
      <BackupTools />
      <EraseLog @erase="erase" />
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
