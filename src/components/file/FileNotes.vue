<script setup lang="ts">
const note = defineModel<string>({ required: true })

defineProps<{
  /** Abnormality name, for the accessible label. */
  name: string
}>()

// Plain :value + input rather than v-model: v-model waits out IME composition,
// the legacy app saves on every input event. Vue only writes `value` back when it
// differs from the field's own text, so the caret stays put.
function onInput(event: Event): void {
  note.value = (event.target as HTMLTextAreaElement).value
}
</script>

<template>
  <div class="file-notes" :data-note="note">
    <textarea
      rows="1"
      :aria-label="'Notes about ' + name"
      placeholder="Add a note…"
      :value="note"
      @input="onInput"
    />
  </div>
</template>

<style scoped lang="scss">
.file-notes {
  position: relative;
  margin-top: 10px;
  border-left: 1px solid var(--line);
}

.file-notes:focus-within {
  border-color: var(--amber);
}

.file-notes::after,
.file-notes textarea {
  display: block;
  padding: 3px 10px;
  min-height: calc(1.5em + 6px);
  font: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

// A hidden copy grows the editor with its text, including a final blank line.
.file-notes::after {
  content: attr(data-note) " ";
  visibility: hidden;
}

.file-notes textarea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 0;
  color: var(--bone);
  caret-color: var(--amber);
  resize: none;
  overflow: hidden;
}

.file-notes textarea::placeholder {
  color: var(--dust);
  opacity: 1;
}

.file-notes textarea:focus {
  outline: none;
}
</style>
