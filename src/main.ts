// Global styles load first, so component styles come after them in the bundle.
import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'

const app = createApp(App).use(i18n)

// Author mode: the dev server with VITE_AUTHOR=true (see README). A build never
// has it, and this condition is how the editor stays out of the bundle.
if (import.meta.env.DEV && import.meta.env.VITE_AUTHOR === 'true') {
  const { installAuthoring } = await import('./author')
  installAuthoring(app)
}

app.mount('#app')
