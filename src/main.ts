// Global styles load first, so component styles come after them in the bundle.
import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'

createApp(App).use(i18n).mount('#app')
