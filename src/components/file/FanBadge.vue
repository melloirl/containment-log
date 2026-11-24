<script setup lang="ts">
import StarIcon from '@/components/shared/StarIcon.vue'
</script>

<template>
  <p class="fan"><StarIcon />{{ $t('review.fan') }}</p>
</template>

<style scoped lang="scss">
.fan {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--gold);
  color: var(--gold);
}

// Reaches StarIcon: a child component's root carries this scope too.
.fan svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linejoin: round;
}
</style>
