import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import './stores/theme'
import './assets/theme.css'

createApp(App).use(router).mount('#app')