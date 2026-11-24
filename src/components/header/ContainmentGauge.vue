<script setup lang="ts">
import { computed } from 'vue'
import { RISKS } from '@/domain/catalog'
import type { Abnormality } from '@/domain/types'

const props = defineProps<{
  /** Logged abnormalities, lowest risk first. One lit cell each. */
  logged: readonly Abnormality[]
  /** Size of the roster: number of cells. */
  total: number
}>()

/** One entry per cell: the inline style of a lit cell, null for an unlit one. */
const cells = computed(() =>
  Array.from({ length: props.total }, (_, i) => {
    const a = props.logged[i]
    return a ? '--c:' + RISKS[a.risk]!.color : null
  }),
)
</script>

<template>
  <div
    class="gauge"
    role="img"
    :aria-label="$t('stats.gauge', { logged: logged.length, total })"
  >
    <template v-for="(style, i) in cells" :key="i">
      <i v-if="style" class="on" :style.attr="style" />
      <i v-else />
    </template>
  </div>
</template>

<style scoped lang="scss">
.gauge {
  display: flex;
  gap: 2px;
  height: 20px;
  margin-top: 20px;
  padding: 3px;
  border: 1px solid var(--line);
  background: #000;
}

.gauge i {
  flex: 1;
  background: #2a2012;
}

.gauge i.on {
  background: var(--c);
}
</style>
