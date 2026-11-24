// Global styles load first, so component styles come after them in the bundle,
// the same order the legacy stylesheet had.
import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
