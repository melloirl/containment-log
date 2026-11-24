<script setup lang="ts">
import FanBadge from './FanBadge.vue'
import RatingAxis from './RatingAxis.vue'
import VerdictCard from './VerdictCard.vue'
import { AXES } from '@/domain/catalog'
import { levelOf, verdict } from '@/domain/verdict'
import type { Entry } from '@/domain/types'

defineProps<{
  entry: Entry
}>()
</script>

<template>
  <section class="sec">
    <h3>{{ $t('review.title') }}</h3>
    <div class="review">
      <RatingAxis v-for="x in AXES" :key="x.key" :axis="x" :level="levelOf(entry, x.key)" />
    </div>
    <VerdictCard :verdict="verdict(entry)" />
    <p class="hint">{{ $t('review.hint') }}</p>
    <FanBadge v-if="entry.fan" />
  </section>
</template>

<style scoped lang="scss">
.review {
  display: grid;
  gap: 14px;
}

.hint {
  margin-top: 8px;
}
</style>
