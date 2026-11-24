<script setup lang="ts">
import { lostRemark } from '@/domain/format'

defineProps<{
  lost: number
}>()

defineEmits<{
  adjust: [delta: number]
}>()
</script>

<template>
  <section class="sec">
    <h3>Agents lost to it</h3>
    <div class="lost">
      <button type="button" class="step" aria-label="One fewer" @click="$emit('adjust', -1)">−</button>
      <output aria-live="polite">{{ lost }}</output>
      <button type="button" class="step" aria-label="One more" @click="$emit('adjust', 1)">+</button>
      <span class="hint">{{ lostRemark(lost) }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.lost {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lost output {
  min-width: 2ch;
  text-align: center;
  font: 700 2.2rem/1 var(--display);
  color: var(--bone);
}

.step {
  width: 42px;
  height: 42px;
  background: transparent;
  border: 1px solid var(--line);
  font: 600 1.4rem/1 var(--display);
  color: var(--bone);
}

.step:hover {
  border-color: var(--amber);
}
</style>
