<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AbnormalityPortrait from '@/components/shared/AbnormalityPortrait.vue'
import { RISKS } from '@/domain/catalog'
import { decode } from '@/domain/decode'
import type { Abnormality } from '@/domain/types'

const props = defineProps<{
  abnormality: Abnormality
  /** Not logged and the spoiler shield is on. */
  sealed: boolean
  /** Has a log entry. */
  logged: boolean
  /** Logged a moment ago: plays the name wipe. */
  fresh: boolean
}>()

const risk = computed(() => RISKS[props.abnormality.risk]!)

// Legacy attribute text, byte for byte (see AbnormalityPortrait for why .attr).
const headStyle = computed(() => '--c:' + (props.sealed ? 'var(--amber)' : risk.value.color))

const nameEl = ref<HTMLElement | null>(null)

// When the wipe ends, repaint the whole head, as the legacy re-render did by
// replacing it. Dropping the class only repaints the h2's own box, and Chrome then
// keeps the subpixel fringe left of the first glyph clipped as the wipe left it.
// A transparent outline for one frame widens the repaint; it never shows.
const headEl = ref<HTMLElement | null>(null)
watch(
  () => props.fresh,
  (now, was) => {
    const el = headEl.value
    if (!was || now || !el) return
    el.style.outline = '1px solid transparent'
    // Back to the exact attribute text Vue renders.
    requestAnimationFrame(() => el.setAttribute('style', headStyle.value))
  },
)

/** Moves focus to the h2, without scrolling unless asked to. */
function focusName(options: FocusOptions = { preventScroll: true }): void {
  nameEl.value?.focus(options)
}

defineExpose({ focusName })
</script>

<template>
  <div
    ref="headEl"
    class="file-head"
    :class="{ 'has-portrait': !sealed, unlocked: logged }"
    :style.attr="headStyle"
  >
    <div>
      <p class="file-code">
        {{ abnormality.code }}<template v-if="!sealed">{{ ' ' }}<span class="tag">{{ risk.key }}</span></template><template v-if="abnormality.tool">{{ ' ' }}<span class="tag hollow">TOOL</span></template>
      </p>
      <h2 ref="nameEl" class="file-name" :class="{ declass: fresh }" tabindex="-1">
        {{ sealed ? 'Unidentified abnormality' : abnormality.name }}
      </h2>
      <p class="file-decode">{{ decode(abnormality) }}</p>
    </div>
    <AbnormalityPortrait v-if="!sealed" :abnormality="abnormality" variant="file" :unlocked="logged" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

// Rules in legacy source order.
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

.file-name.declass {
  animation: wipe .6s steps(14) both;
}

@keyframes wipe {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.file-decode {
  position: relative;
  margin-top: 8px;
  color: var(--dust);
}

@include reduced-motion {
  .file-name.declass {
    animation: none;
  }
}
</style>
