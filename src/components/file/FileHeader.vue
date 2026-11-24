<script setup lang="ts">
import { computed, ref } from 'vue'
import AbnormalityPortrait from '@/components/shared/AbnormalityPortrait.vue'
import { RISKS } from '@/domain/catalog'
import type { Abnormality } from '@/domain/types'

const props = defineProps<{
  abnormality: Abnormality
  /** No entry and the spoiler shield is on. */
  sealed: boolean
  /** Has a log entry. */
  logged: boolean
}>()

const risk = computed(() => RISKS[props.abnormality.risk]!)

const nameEl = ref<HTMLElement | null>(null)

/** Moves focus to the h2. */
function focusName(): void {
  nameEl.value?.focus()
}

defineExpose({ focusName })
</script>

<template>
  <div
    class="file-head"
    :class="{ 'has-portrait': !sealed, unlocked: logged }"
    :style="'--c:' + (sealed ? 'var(--amber)' : risk.color)"
  >
    <div>
      <p class="file-code">
        {{ abnormality.code }}
        <span v-if="!sealed" class="tag">{{ risk.key }}</span>
        <span v-if="abnormality.tool" class="tag hollow">{{ $t('file.tool') }}</span>
      </p>
      <h2 ref="nameEl" class="file-name" tabindex="-1">
        {{ sealed ? $t('file.unidentified') : abnormality.name }}
      </h2>
      <p class="file-decode">
        {{
          abnormality.letter
            ? $t('decode.standard', {
                origin: $t('origin.' + abnormality.letter),
                form: $t('form.' + (abnormality.form ?? 'unknown')),
              })
            : $t('decode.nonStandard')
        }}
      </p>
    </div>
    <AbnormalityPortrait v-if="!sealed" :abnormality="abnormality" variant="file" :unlocked="logged" />
  </div>
</template>

<style scoped lang="scss">
.file-head {
  position: relative;
  overflow: hidden;
  margin: 0 -16px;
  padding: 22px 16px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--cell);
}

.file-head::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: var(--c);
}

// Sizes the portrait's grid column; the portrait's own rules live in AbnormalityPortrait.
.file-head.has-portrait {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(70px, 23%, 98px);
  gap: 12px;
  align-items: start;
}

.file-head.unlocked {
  grid-template-columns: minmax(0, 1fr) clamp(86px, 31%, 128px);
}

.file-code {
  font: 600 1.5rem/1.1 var(--display);
  letter-spacing: .06em;
  color: var(--c);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
}

.tag {
  padding: 1px 9px;
  background: var(--c);
  color: #000;
  font: 700 .9rem/1.4 var(--display);
  letter-spacing: .1em;
}

.tag.hollow {
  background: transparent;
  color: var(--bone);
  box-shadow: inset 0 0 0 1px var(--line);
}

.file-name {
  position: relative;
  margin-top: 10px;
  // Interpolated so Sass leaves the clamp()/line-height pair alone.
  font: 700 #{'clamp(1.7rem,6vw,2.2rem)/1.08'} var(--display);
  text-transform: uppercase;
  letter-spacing: .015em;
  max-width: 18ch;
  overflow-wrap: anywhere;
}


.file-decode {
  position: relative;
  margin-top: 8px;
  color: var(--dust);
}

</style>
