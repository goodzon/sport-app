import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/global.scss'

// Configure API URL
const apiBaseUrl = window.VUE_APP_CONFIG?.apiUrl || '/api';
console.log('Using API URL:', apiBaseUrl);

// Create app
const app = createApp(App)

// Register plugins
app.use(router)
app.use(store)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global Vue error:', err)
  console.log('Component:', vm)
  console.log('Info:', info)
}

// Mount app
app.mount('#app')
