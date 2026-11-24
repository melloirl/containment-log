<script setup lang="ts">
defineProps<{
  logged: number
  total: number
  lost: number
  fans: number
}>()
</script>

<template>
  <ul class="stats">
    <li><b>{{ logged }} / {{ total }}</b>{{ $t('stats.logged') }}</li>
    <li><b>{{ lost }}</b>{{ $t('stats.agentsLost', lost) }}</li>
    <li><b>{{ fans }}</b>{{ $t('stats.fanClubs', fans) }}</li>
  </ul>
</template>

<style scoped lang="scss">
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 28px;
  margin-top: 10px;
  padding: 0;
  list-style: none;
}

.stats li {
  color: var(--dust);
}

.stats b {
  font: 600 1.5rem/1 var(--display);
  color: var(--bone);
  margin-right: 6px;
  letter-spacing: .02em;
}
</style>
