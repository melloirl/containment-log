<script setup lang="ts">
import { nextTick, ref } from 'vue'

const emit = defineEmits<{
  erase: []
}>()

// Owns the idle and confirm states, and the focus hand-off between them.
const confirming = ref(false)
const eraseButton = ref<HTMLButtonElement | null>(null)
const keepButton = ref<HTMLButtonElement | null>(null)

async function ask(): Promise<void> {
  confirming.value = true
  await nextTick()
  keepButton.value?.focus()
}

async function keep(): Promise<void> {
  confirming.value = false
  await nextTick()
  eraseButton.value?.focus()
}

function confirm(): void {
  emit('erase')
  confirming.value = false
}
</script>

<template>
  <div class="row">
    <template v-if="confirming">
      <span>Erase every note, review, and counter?</span>
      <button class="btn danger" type="button" @click="confirm">Erase the whole log</button>
      <button ref="keepButton" class="btn ghost" type="button" @click="keep">Keep it</button>
    </template>
    <button v-else ref="eraseButton" class="linkish" type="button" @click="ask">Erase the whole log</button>
  </div>
</template>

<style scoped lang="scss">
// Beats the amber of the global .linkish: this link destroys data.
.linkish {
  color: #ff8080;
}
</style>
