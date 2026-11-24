<script setup lang="ts">
import { lostRemark } from '@/domain/format'

defineProps<{
  lost: number
}>()
</script>

<template>
  <section class="sec">
    <h3>{{ $t('lost.title') }}</h3>
    <div class="lost">
      <output>{{ lost }}</output>
      <span class="hint">{{ $t('lost.remark.' + lostRemark(lost)) }}</span>
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
</style>
