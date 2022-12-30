import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import "bootstrap/dist/css/bootstrap.min.css"
import './assets/main.css'
import './assets/styles/index.scss'

const app = createApp(App)

import "bootstrap/dist/js/bootstrap.js"

app.use(createPinia())
app.use(router)

app.mount('#app')
