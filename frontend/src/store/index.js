import { createStore } from 'vuex'
import app from './modules/app'
import auth from './modules/auth'
import products from './modules/products'
import playlists from './modules/playlists'

export default createStore({
  modules: {
    app,
    auth,
    products,
    playlists
  },
  // Глобальное состояние
  state: {
  },
  // Геттеры для получения данных из состояния
  getters: {
  },
  // Мутации для изменения состояния
  mutations: {
  },
  // Действия для асинхронной логики
  actions: {
    // Инициализация приложения
    init({ dispatch }) {
      // Загружаем пользователя из localStorage
      dispatch('auth/loadUser')
      
      // Загружаем настройки темы
      dispatch('app/initTheme')
      
      // Загружаем категории продуктов
      dispatch('products/fetchCategories')
    }
  }
})