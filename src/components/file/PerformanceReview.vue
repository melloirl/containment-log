<script setup lang="ts">
import FanButton from './FanButton.vue'
import RatingAxis from './RatingAxis.vue'
import VerdictCard from './VerdictCard.vue'
import { AXES } from '@/domain/catalog'
import { verdict } from '@/domain/verdict'
import type { AxisKey, EntryView } from '@/domain/types'

defineProps<{
  entry: EntryView
}>()

defineEmits<{
  rate: [axis: AxisKey, level: number]
  'toggle-fan': []
}>()
</script>

<template>
  <section class="sec">
    <h3>Performance review</h3>
    <div class="review">
      <RatingAxis
        v-for="x in AXES"
        :key="x.key"
        :axis="x"
        :level="entry.a[x.key]"
        @rate="$emit('rate', x.key, $event)"
      />
    </div>
    <VerdictCard :verdict="verdict(entry)" />
    <p class="hint" style="margin-top:8px">Usefulness is half the score. Low danger and low management earn the rest.</p>
    <FanButton :fan="entry.fan" @toggle="$emit('toggle-fan')" />
  </section>
</template>

<style scoped lang="scss">
.review {
  display: grid;
  gap: 14px;
}
</style>
