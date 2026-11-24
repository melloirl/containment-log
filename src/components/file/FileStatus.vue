<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { formatDate } from '@/domain/format'

const confirming = defineModel<boolean>('confirming', { required: true })

defineProps<{
  /** Timestamp (ms) of the first encounter. */
  met: number
}>()

defineEmits<{
  remove: []
}>()

const askEl = ref<HTMLButtonElement | null>(null)
const keepEl = ref<HTMLButtonElement | null>(null)

// The confirmation swaps the controls, so focus is handed to the one that replaces the pressed one.
async function ask(): Promise<void> {
  confirming.value = true
  await nextTick()
  keepEl.value?.focus({ preventScroll: true })
}

async function keep(): Promise<void> {
  confirming.value = false
  await nextTick()
  askEl.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="file-status">
    <span>Logged on {{ formatDate(met) }}</span>
    <template v-if="confirming">
      <span>Erase its notes and review too?</span>
      <button type="button" class="btn danger" @click="$emit('remove')">Remove from log</button>
      <button ref="keepEl" type="button" class="btn ghost" @click="keep">Keep it</button>
    </template>
    <button v-else ref="askEl" type="button" class="linkish" @click="ask">Remove from log</button>
  </div>
</template>

<style scoped lang="scss">
.file-status {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: center;
  color: var(--dust);
}
</style>
