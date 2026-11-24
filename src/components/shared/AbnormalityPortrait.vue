<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { portraitUrl, spriteOffset } from '@/domain/portrait'
import type { Abnormality } from '@/domain/types'

const props = defineProps<{
  abnormality: Abnormality
  /** 'unit' renders .u-portrait (grid tile, lazy image); 'file' renders .file-portrait. */
  variant: 'unit' | 'file'
  /** Logged: load the in-game portrait over the silhouette. */
  unlocked: boolean
}>()

const spriteStyle = computed(() => {
  const { x, y } = spriteOffset(props.abnormality.portrait)
  return '--sprite-x:' + x + '%;--sprite-y:' + y + '%'
})

const src = computed(() => portraitUrl(props.abnormality))

// Set once the in-game portrait has loaded; it then replaces the silhouette.
// Reset when the instance is reused for another abnormality or gets locked.
const loaded = ref(false)
// Multi-source form: each source is compared on its own, so a re-render with
// the same code and state (same img element, no new load event) keeps the flag.
watch([() => props.abnormality.code, () => props.unlocked], () => {
  loaded.value = false
})
</script>

<template>
  <span
    class="portrait"
    :class="[variant === 'unit' ? 'u-portrait' : 'file-portrait', { 'image-loaded': loaded }]"
    aria-hidden="true"
    :style="spriteStyle"
  >
    <img
      v-if="unlocked"
      :key="src"
      class="game-portrait"
      :src="src"
      alt=""
      referrerpolicy="no-referrer"
      decoding="async"
      :loading="variant === 'unit' ? 'lazy' : undefined"
      @load="loaded = true"
    >
  </span>
</template>

<style scoped lang="scss">
// Order matters: pairs of equal specificity rely on it.
.portrait {
  display: block;
  aspect-ratio: 1;
  position: relative;
  pointer-events: none;
}

.portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--c);
  mask-position: var(--sprite-x) var(--sprite-y);
  mask-size: 1000% 900%;
  mask-repeat: no-repeat;
}

.u-portrait {
  width: 42px;
}

.u-portrait::after {
  opacity: .88;
}

.game-portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
}

.portrait.image-loaded .game-portrait {
  opacity: 1;
}

.portrait.image-loaded::after {
  opacity: 0;
}

.file-portrait {
  width: 100%;
  background: #120d08;
  border: 1px solid var(--line);
}

.file-portrait::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid color-mix(in srgb, var(--c) 26%, transparent);
}

.file-portrait::after {
  inset: 7px;
}

.file-portrait .game-portrait {
  inset: 7px;
  width: calc(100% - 14px);
  height: calc(100% - 14px);
}

// Silhouette atlas, 10 columns by 9 rows.
.portrait::after {
  mask-image: url('@/assets/silhouette-atlas.png');
}
</style>
