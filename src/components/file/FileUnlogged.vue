<script setup lang="ts">
defineProps<{
  sealed: boolean
}>()

defineEmits<{
  log: []
}>()
</script>

<template>
  <div class="sec">
    <p>
      {{
        sealed
          ? 'All you have so far is the classification code. Log it once it arrives in your facility to unlock its name, portrait, and risk level.'
          : 'Log an encounter to unlock its portrait.'
      }}
    </p>
    <p style="margin-top:14px"><button type="button" class="btn" @click="$emit('log')">Log encounter</button></p>
  </div>
</template>
