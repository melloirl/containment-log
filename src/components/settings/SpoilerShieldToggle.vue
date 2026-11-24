<script setup lang="ts">
const shield = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="check">
    <input v-model="shield" type="checkbox">
    <span><b>{{ $t('settings.shieldName') }}</b> {{ $t('settings.shieldHelp') }}</span>
  </label>
</template>

<style scoped lang="scss">
.check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.check input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--amber);
  flex: none;
}
</style>
