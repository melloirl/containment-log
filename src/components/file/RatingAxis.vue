<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReviewAxis } from '@/domain/types'

const props = defineProps<{
  axis: ReviewAxis
  /** 0 when not rated, else the 1-based level. */
  level: number
}>()

const emit = defineEmits<{
  rate: [level: number]
}>()

const axisStyle = computed(() => '--k:var(' + props.axis.colorVar + ')')
const setName = computed(() => (props.level ? props.axis.levels[props.level - 1]! : 'Not rated'))

// Legacy peek(): pointing at a segment, or reaching one by keyboard, names the
// level it would set. Each pointer/focus event decides on its own, last one wins.
const peeked = ref<string | null>(null)
const shown = computed(() => peeked.value ?? setName.value)

function focusVisible(event: Event): boolean {
  return (event.currentTarget as Element).matches(':focus-visible')
}

function onFocus(event: FocusEvent, name: string): void {
  peeked.value = focusVisible(event) ? name : null
}

function onClick(event: MouseEvent, name: string, n: number): void {
  // Legacy re-renders the meter here and re-focuses the pressed segment (the
  // focus rule runs again), then Chrome sends pointerover to whatever segment
  // now sits under the pointer. Replay both on the segments that stayed.
  const hovered = (event.currentTarget as Element).parentElement?.querySelector('.seg:hover')
  peeked.value = hovered ? hovered.getAttribute('title') : focusVisible(event) ? name : null
  emit('rate', n)
}
</script>

<template>
  <div class="axis" :style.attr="axisStyle">
    <div class="axis-top">
      <span class="lab">{{ axis.label }}</span>
      <span class="val" :class="{ unset: !level, peek: shown !== setName }">{{ shown }}</span>
    </div>
    <div class="meter" :class="{ unset: !level }" role="group" :aria-label="axis.label">
      <button
        v-for="(name, i) in axis.levels"
        :key="name"
        type="button"
        class="seg"
        :class="{ zero: i === 0, on: level >= i + 1 }"
        :aria-pressed="level === i + 1"
        :aria-label="axis.label + ': ' + name"
        :title="name"
        @click="onClick($event, name, i + 1)"
        @pointerover="peeked = name"
        @pointerout="peeked = null"
        @focus="onFocus($event, name)"
        @blur="peeked = null"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
// Rules in legacy source order; .val.unset/.val.peek rely on it.
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

.axis-top .val.peek {
  color: var(--bone);
}

// The narrow first cell is the scale's zero: a real answer, lit on its own.
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
  padding: 0;
  border: 0;
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

.seg:hover {
  box-shadow: inset 0 0 0 2px var(--bone);
}
</style>
