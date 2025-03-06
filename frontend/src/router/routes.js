import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import store from '@/store'

// Создаем экземпляр маршрутизатора
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  // Прокрутка страницы вверх при переходе
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Глобальный обработчик перед каждым переходом
router.beforeEach((to, from, next) => {
  // Проверка, требуется ли авторизация для текущего маршрута
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  // Проверка, доступен ли маршрут только для гостей
  const guestOnly = to.matched.some(record => record.meta.guest)
  
  // Проверяем, авторизован ли пользователь
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  // Устанавливаем заголовок страницы
  document.title = to.meta.title || 'FitBeast'
  
  // Логика навигации
  if (requiresAuth && !isAuthenticated) {
    // Если требуется авторизация, но пользователь не авторизован,
    // перенаправляем на страницу входа
    next({
      path: '/login',
      query: { redirect: to.fullPath } // Сохраняем URL для редиректа после входа
    })
  } else if (guestOnly && isAuthenticated) {
    // Если страница только для гостей, а пользователь авторизован,
    // перенаправляем на главную страницу
    next({ path: '/' })
  } else {
    // В остальных случаях продолжаем переход
    next()
  }
})

export default router