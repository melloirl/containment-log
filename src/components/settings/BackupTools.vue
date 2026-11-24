<script setup lang="ts">
// Container. Uses useContainmentLog() for exportBackup and restoreBackup, and useLogBrowser().close() after a restore.
// Owns the backup textarea and both status messages.
import { ref } from 'vue'
import { useContainmentLog } from '@/composables/useContainmentLog'
import { useLogBrowser } from '@/composables/useLogBrowser'

const log = useContainmentLog()
const browser = useLogBrowser()

const backup = ref('')
const box = ref<HTMLTextAreaElement | null>(null)
const copyMsg = ref('')
const restoreMsg = ref('')

const RESTORE_ERRORS = {
  empty: 'Paste a backup into the box first.',
  'not-json':
    "That text isn't a backup from this log. Paste the whole thing, starting with { and ending with }.",
  'not-backup': "That text isn't a backup from this log.",
} as const

function copy(): void {
  const text = log.exportBackup()
  // Synchronous like the legacy fallback: the box gets the text, focus and selection at once.
  const fallback = (): void => {
    backup.value = text
    const el = box.value
    if (el) {
      el.value = text
      el.focus()
      el.select()
    }
    copyMsg.value = 'Copying was blocked. The backup is in the box below; select it and copy it yourself.'
  }
  try {
    navigator.clipboard.writeText(text).then(() => {
      copyMsg.value = 'Backup copied'
    }, fallback)
  } catch {
    fallback()
  }
}

function restore(): void {
  const result = log.restoreBackup(backup.value)
  if (!result.ok) {
    restoreMsg.value = RESTORE_ERRORS[result.reason]
    return
  }
  backup.value = ''
  browser.close()
  restoreMsg.value = 'Backup restored: ' + result.count + ' logged.'
}
</script>

<template>
  <div>
    <p>Your log lives only in this browser. Copy a backup to move it to another device or keep it safe.</p>
    <div class="row">
      <button class="btn ghost" type="button" @click="copy">Copy backup</button>
      <span class="msg" aria-live="polite">{{ copyMsg }}</span>
    </div>
    <textarea
      ref="box"
      v-model="backup"
      aria-label="Backup text"
      placeholder="Paste a backup here to restore it"
    />
    <div class="row">
      <button class="btn ghost" type="button" @click="restore">Restore backup</button>
      <span class="msg" aria-live="polite">{{ restoreMsg }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings textarea {
  width: 100%;
  min-height: 76px;
  padding: 10px 12px;
  background: #000;
  border: 1px solid var(--line);
  color: var(--bone);
  border-radius: 0;
  font-size: .85rem;
  margin-top: 10px;
}

.row {
  margin-top: 8px;
}
</style>
