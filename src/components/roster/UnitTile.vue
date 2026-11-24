<script setup lang="ts">
import { computed } from 'vue'
import AbnormalityPortrait from '@/components/shared/AbnormalityPortrait.vue'
import StarIcon from '@/components/shared/StarIcon.vue'
import { AXES, RISKS } from '@/domain/catalog'
import { levelOf, verdict } from '@/domain/verdict'
import type { Entry, UnitView } from '@/domain/types'

const props = defineProps<{
  unit: UnitView
  /** The log entry, when the unit is logged. */
  entry?: Entry
  /** Its file is open. */
  selected: boolean
}>()

defineEmits<{
  open: []
}>()

const risk = computed(() => RISKS[props.unit.abnormality.risk]!)

/** Logged tile: verdict, fan, losses, or the review status when none of those show. */
const meta = computed(() => {
  const e = props.unit.met ? props.entry : undefined
  if (!e) return null
  const vd = verdict(e)
  const lost = e.agentsLost ?? 0
  const started = AXES.some((x) => levelOf(e, x.key))
  const status = !vd && !e.fan && !lost ? (started ? 'unit.reviewUnfinished' : 'unit.notReviewed') : null
  return { vd, fan: !!e.fan, lost, status }
})
</script>

<template>
  <button
    type="button"
    class="unit"
    :class="{ sealed: unit.sealed, 'open-file': !unit.sealed && !unit.met }"
    :data-code="unit.abnormality.code"
    :style="unit.sealed ? undefined : '--c:' + risk.color"
    :aria-current="selected ? 'true' : undefined"
    @click="$emit('open')"
  >
    <span class="in">
      <template v-if="unit.sealed">
        <span class="u-code">{{ unit.abnormality.code }}</span>
        <span v-if="unit.peek" class="u-name">{{ unit.abnormality.name }}</span>
        <span v-else class="bars" aria-hidden="true"><i /><i /></span>
        <span class="u-meta">{{ $t(unit.peek ? 'unit.notLogged' : 'unit.unidentified') }}</span>
      </template>
      <template v-else>
        <span class="unit-id">
          <span>
            <span class="u-code">{{ unit.abnormality.code }}</span>
            <span class="u-risk">{{ risk.key }}</span>
          </span>
          <AbnormalityPortrait :abnormality="unit.abnormality" variant="unit" :unlocked="unit.met" />
        </span>
        <span class="u-name">{{ unit.abnormality.name }}</span>
        <span class="u-meta">
          <template v-if="meta">
            <template v-if="meta.vd">
              <span class="score">{{ meta.vd.score }}</span>
              <span>{{ $t('verdict.' + meta.vd.tier + '.call') }}</span>
            </template>
            <span v-if="meta.fan" class="m k-f" :title="$t('unit.fan')"><StarIcon /></span>
            <span v-if="meta.lost">{{ $t('unit.lost', { n: meta.lost }) }}</span>
            <span v-if="meta.status">{{ $t(meta.status) }}</span>
          </template>
          <span v-else>{{ $t('unit.notLogged') }}</span>
        </span>
      </template>
    </span>
  </button>
</template>

<style scoped lang="scss">

// Order matters: pairs of equal specificity rely on it.
.unit {
  --c: var(--line);
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  padding: 1px;
  background: var(--line);
  clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%);
}

.unit .in {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 128px;
  height: 100%;
  padding: 10px 10px 9px 16px;
  background: var(--cell);
  overflow: hidden;
  clip-path: polygon(0 0, calc(100% - var(--cut) + .5px) 0, 100% calc(var(--cut) - .5px), 100% 100%, 0 100%);
}

.unit .in::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: var(--c);
}

.unit:hover {
  background: var(--amber);
}

.unit:focus-visible {
  outline: none;
  background: var(--bone);
}

.unit[aria-current="true"] {
  background: var(--amber);
}

.unit[aria-current="true"] .in {
  background: var(--cell-2);
}

.unit-id {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 4px;
  align-items: start;
}

.u-code {
  display: block;
  font: 600 1.2rem/1.1 var(--display);
  letter-spacing: .05em;
  color: var(--c);
  overflow-wrap: anywhere;
}

.u-risk {
  display: inline-block;
  margin-top: 5px;
  padding: 1px 7px;
  background: var(--c);
  color: #000;
  font: 700 .78rem/1.3 var(--display);
  letter-spacing: .1em;
}

.u-name {
  margin-top: 8px;
  font-weight: 500;
  font-size: .95rem;
  line-height: 1.25;
  position: relative;
  z-index: 1;
  overflow-wrap: anywhere;
}

.u-meta {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 9px;
  align-items: center;
  font-size: .82rem;
  color: var(--dust);
  position: relative;
  z-index: 1;
}

.u-meta .m {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--bone);
}

// Reaches the StarIcon root, which carries this component's scope.
.u-meta svg {
  width: 14px;
  height: 14px;
}

.u-meta .score {
  font: 700 1rem/1 var(--display);
  letter-spacing: .04em;
  color: var(--amber);
}

.unit.sealed .in {
  background: repeating-linear-gradient(135deg, #17110a 0 10px, #1d160d 10px 20px);
}

.unit.sealed .u-code {
  color: var(--amber);
}

.unit.sealed .in::before {
  background: var(--line);
}

.bars {
  margin-top: 12px;
  display: grid;
  gap: 5px;
}

.bars i {
  display: block;
  height: .7em;
  background: #000;
}

.bars i:first-child {
  width: 82%;
}

.bars i:last-child {
  width: 48%;
}

.unit.open-file .in::before {
  background: transparent;
  border-right: 1px solid var(--c);
}

.unit.open-file .u-name,
.unit.open-file .u-code {
  opacity: .62;
}

.unit.open-file .u-risk {
  background: transparent;
  color: var(--c);
  box-shadow: inset 0 0 0 1px var(--c);
}

.m.k-f {
  color: var(--gold);
}

.m.k-f svg {
  fill: currentColor;
}

</style>
