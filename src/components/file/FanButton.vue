<script setup lang="ts">
import StarIcon from '@/components/shared/StarIcon.vue'

defineProps<{
  fan: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button type="button" class="fan" :aria-pressed="fan" @click="$emit('toggle')">
    <StarIcon />{{ fan ? "You're a fan" : 'Become a fan' }}
  </button>
</template>

<style scoped lang="scss">
// `.fan svg` reaches StarIcon: a child component's root carries this scope too.
.fan {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--bone);
}

.fan svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.fan[aria-pressed="true"] {
  border-color: var(--gold);
  color: var(--gold);
}

.fan[aria-pressed="true"] svg {
  fill: currentColor;
}
</style>
