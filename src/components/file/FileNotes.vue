<script setup lang="ts">
defineProps<{
  note: string
  /** Abnormality name, for the accessible label. */
  name: string
}>()
</script>

<template>
  <p class="file-notes" :aria-label="$t('file.notes', { name })">{{ note }}</p>
</template>

<style scoped lang="scss">
.file-notes {
  margin-top: 10px;
  padding: 3px 10px;
  border-left: 1px solid var(--line);
  // Notes are written with blank lines between paragraphs.
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
