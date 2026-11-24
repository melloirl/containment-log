<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReviewAxis } from '@/domain/types'

const props = defineProps<{
  axis: ReviewAxis
  /** 0 when not rated, else the 1-based level. */
  level: number
}>()

const { t } = useI18n()

const label = computed(() => t('axis.' + props.axis.key + '.label'))
const levelName = (key: string): string => t('axis.' + props.axis.key + '.levels.' + key)
const current = computed(() => {
  const key = props.axis.levels[props.level - 1]
  return key ? levelName(key) : t('review.notRated')
})
</script>

<template>
  <div class="axis" :style="'--k:var(' + axis.colorVar + ')'">
    <div class="axis-top">
      <span class="lab">{{ label }}</span>
      <span class="val" :class="{ unset: !level }">{{ current }}</span>
    </div>
    <!-- The narrow first cell is the scale's zero: a real answer, lit on its own. -->
    <div
      class="meter"
      :class="{ unset: !level }"
      role="img"
      :aria-label="t('review.axisLevel', { axis: label, level: current })"
    >
      <span
        v-for="(key, i) in axis.levels"
        :key="key"
        class="seg"
        :class="{ zero: i === 0, on: level >= i + 1 }"
        :title="levelName(key)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.axis {
  display: grid;
  gap: 5px;
}

.axis-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.axis-top .lab {
  font-weight: 500;
}

.axis-top .val {
  font: 600 1.05rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--k);
  text-align: right;
}

.axis-top .val.unset {
  color: var(--dust);
}

.meter {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--line);
  background: #000;
}

.seg {
  flex: 1;
  height: 24px;
  background: #2a2012;
}

.seg.zero {
  flex: 0 0 24px;
}

.seg.on {
  background: var(--k);
}

.meter.unset .seg {
  background: repeating-linear-gradient(135deg, #17110a 0 6px, #231a0e 6px 12px);
}
</style>
