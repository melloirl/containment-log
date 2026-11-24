<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import RosterControls from '@/components/controls/RosterControls.vue'
import AbnormalityFile from '@/components/file/AbnormalityFile.vue'
import AppHeader from '@/components/header/AppHeader.vue'
import UnitGrid from '@/components/roster/UnitGrid.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { useAuthorTools } from '@/composables/useAuthorTools'

// Null for readers.
const author = useAuthorTools()
</script>

<template>
  <div class="hazard" aria-hidden="true" />
  <div class="wrap">
    <AppHeader />
    <RosterControls />
    <div class="layout">
      <main>
        <UnitGrid />
      </main>
      <AbnormalityFile />
    </div>
    <SettingsPanel />
    <AppFooter />
  </div>
  <component :is="author.PublishBar" v-if="author" />
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.hazard {
  height: 8px;
  background: repeating-linear-gradient(-45deg, var(--amber) 0 12px, #000 12px 24px);
}

.wrap {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px 16px 56px;

  @include desktop {
    padding: 28px 28px 64px;
  }
}

.layout {
  margin-top: 14px;

  @include desktop {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 24px;
    align-items: start;
  }
}
</style>
