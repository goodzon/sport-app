import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/global.scss'

const app = createApp(App)

app.use(router)
app.use(store)

// Глобальная обработка ошибок
app.config.errorHandler = (err, vm, info) => {
  console.error('Глобальная ошибка Vue:', err)
  console.error('Компонент:', vm)
  console.error('Информация:', info)
  
  // Отправка ошибок в аналитику или на сервер
  // analyticsService.logError(err)
}

app.mount('#app')