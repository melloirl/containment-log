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
    <li><b>{{ logged }} / {{ total }}</b>logged</li>
    <li><b>{{ lost }}</b>{{ lost === 1 ? 'agent lost' : 'agents lost' }}</li>
    <li><b>{{ fans }}</b>{{ fans === 1 ? 'fan club joined' : 'fan clubs joined' }}</li>
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
