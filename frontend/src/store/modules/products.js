import productsService from '@/services/productsService';

export default {
  namespaced: true,
  
  state: {
    // Список продуктов
    items: [],
    
    // Общее количество продуктов (для пагинации)
    totalItems: 0,
    
    // Текущий продукт
    currentProduct: null,
    
    // Категории продуктов
    categories: [],
    
    // Избранные продукты
    favorites: [],
    
    // Статус загрузки
    loading: false,
    loadingCategories: false,
    loadingFavorites: false,
    
    // Сообщение об ошибке
    error: null
  },
  
  getters: {
    // Получение продуктов
    getProducts: (state) => state.items,
    
    // Получение текущего продукта
    getCurrentProduct: (state) => state.currentProduct,
    
    // Получение категорий
    getCategories: (state) => state.categories,
    
    // Получение избранных продуктов
    getFavorites: (state) => state.favorites,
    
    // Проверка, находится ли продукт в избранном
    isProductFavorite: (state) => (productId) => {
      return state.favorites.some(product => product.id === productId);
    },
    
    // Получение категории по slug
    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find(category => category.slug === slug);
    },
    
    // Получение имени категории по slug
    getCategoryNameBySlug: (state, getters) => (slug) => {
      const category = getters.getCategoryBySlug(slug);
      return category ? category.name : 'Категория';
    }
  },
  
  mutations: {
    // Установка продуктов
    SET_PRODUCTS(state, { products, totalItems }) {
      state.items = products;
      state.totalItems = totalItems;
    },
    
    // Установка текущего продукта
    SET_CURRENT_PRODUCT(state, product) {
      state.currentProduct = product;
    },
    
    // Установка категорий
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    
    // Установка избранных продуктов
    SET_FAVORITES(state, products) {
      state.favorites = products;
    },
    
    // Добавление продукта в избранное
    ADD_TO_FAVORITES(state, product) {
      if (!state.favorites.some(p => p.id === product.id)) {
        state.favorites.push(product);
      }
    },
    
    // Удаление продукта из избранного
    REMOVE_FROM_FAVORITES(state, productId) {
      state.favorites = state.favorites.filter(product => product.id !== productId);
    },
    
    // Установка статуса загрузки
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    
    // Установка статуса загрузки категорий
    SET_LOADING_CATEGORIES(state, isLoading) {
      state.loadingCategories = isLoading;
    },
    
    // Установка статуса загрузки избранного
    SET_LOADING_FAVORITES(state, isLoading) {
      state.loadingFavorites = isLoading;
    },
    
    // Установка ошибки
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    // Очистка ошибки
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  
  actions: {
    // Получение продуктов
    async fetchProducts({ commit, dispatch }, params = {}) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await productsService.getProducts(params);
        
        commit('SET_PRODUCTS', {
          products: response.data,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке продуктов');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение продукта по ID
    async fetchProductById({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await productsService.getProductById(id);
        
        commit('SET_CURRENT_PRODUCT', response.data);
        
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке продукта');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение продуктов по категории
    async fetchProductsByCategory({ commit, dispatch }, { slug, params = {} }) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await productsService.getProductsByCategory(slug, params);
        
        commit('SET_PRODUCTS', {
          products: response.data.products,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке продуктов категории');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Поиск продуктов
    async searchProducts({ commit, dispatch }, { query, params = {} }) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await productsService.searchProducts(query, params);
        
        commit('SET_PRODUCTS', {
          products: response.data,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при поиске продуктов');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение категорий продуктов
    async fetchCategories({ commit, dispatch }) {
      try {
        commit('SET_LOADING_CATEGORIES', true);
        
        const response = await productsService.getCategories();
        
        commit('SET_CATEGORIES', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING_CATEGORIES', false);
      }
    },
    
    // Получение избранных продуктов
    async fetchFavorites({ commit, dispatch, rootState }) {
      try {
        // Проверяем, авторизован ли пользователь
        if (!rootState.auth.isLoggedIn) {
          return [];
        }
        
        commit('SET_LOADING_FAVORITES', true);
        
        const response = await productsService.getFavorites();
        
        commit('SET_FAVORITES', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке избранных продуктов:', error);
        throw error;
      } finally {
        commit('SET_LOADING_FAVORITES', false);
      }
    },
    
    // Добавление продукта в избранное
    async addToFavorites({ commit, dispatch, state }, productId) {
      try {
        await productsService.addToFavorites(productId);
        
        // Если у нас есть информация о продукте в текущем списке
        const product = state.items.find(p => p.id === productId) || state.currentProduct;
        
        if (product) {
          commit('ADD_TO_FAVORITES', product);
        } else {
          // Если нет, загружаем информацию о продукте
          const response = await productsService.getProductById(productId);
          commit('ADD_TO_FAVORITES', response.data);
        }
        
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Продукт добавлен в избранное'
        }, { root: true });
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при добавлении в избранное'
        }, { root: true });
        throw error;
      }
    },
    
    // Удаление продукта из избранного
    async removeFromFavorites({ commit, dispatch }, productId) {
      try {
        await productsService.removeFromFavorites(productId);
        
        commit('REMOVE_FROM_FAVORITES', productId);
        
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Продукт удален из избранного'
        }, { root: true });
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при удалении из избранного'
        }, { root: true });
        throw error;
      }
    }
  }
}