<script setup lang="ts">
import { CATALOG } from '@/domain/catalog'

const GALLERY = 'https://lobotomycorporation.wiki.gg/wiki/Category:Abnormality_Portraits'
</script>

<template>
  <footer>
    <p>{{ $t('footer.about', { count: CATALOG.length }) }}</p>
    <p>{{ $t('footer.portraits') }} <a :href="GALLERY">{{ $t('footer.gallery') }}</a></p>
  </footer>
</template>

<style scoped lang="scss">
footer {
  margin-top: 36px;
  color: var(--dust);
  font-size: .88rem;
  max-width: 70ch;
}

footer a {
  color: var(--amber);
  text-underline-offset: 3px;
}
</style>
