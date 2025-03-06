import api from './api';

export default {
  /**
   * Получение всех продуктов с фильтрацией, сортировкой и пагинацией
   * @param {Object} params - Параметры запроса
   * @returns {Promise}
   */
  getProducts(params = {}) {
    const queryString = api.buildQueryParams(params);
    return api.get(`/products?${queryString}`);
  },

  /**
   * Получение продукта по ID
   * @param {Number} id - ID продукта
   * @returns {Promise}
   */
  getProductById(id) {
    return api.get(`/products/${id}`);
  },

  /**
   * Получение всех категорий продуктов
   * @returns {Promise}
   */
  getCategories() {
    return api.get('/products/categories');
  },

  /**
   * Получение продуктов по категории
   * @param {String} slug - Slug категории
   * @param {Object} params - Параметры запроса (пагинация, сортировка)
   * @returns {Promise}
   */
  getProductsByCategory(slug, params = {}) {
    const queryString = api.buildQueryParams(params);
    return api.get(`/products/category/${slug}?${queryString}`);
  },

  /**
   * Поиск продуктов по тексту
   * @param {String} query - Поисковый запрос
   * @param {Object} params - Параметры запроса (пагинация, сортировка)
   * @returns {Promise}
   */
  searchProducts(query, params = {}) {
    const queryParams = {
      ...params,
      query
    };
    const queryString = api.buildQueryParams(queryParams);
    return api.get(`/products/search?${queryString}`);
  },

  /**
   * Добавление продукта в избранное
   * @param {Number} productId - ID продукта
   * @returns {Promise}
   */
  addToFavorites(productId) {
    return api.post(`/products/favorite/${productId}`);
  },

  /**
   * Удаление продукта из избранного
   * @param {Number} productId - ID продукта
   * @returns {Promise}
   */
  removeFromFavorites(productId) {
    return api.delete(`/products/favorite/${productId}`);
  },

  /**
   * Получение избранных продуктов пользователя
   * @returns {Promise}
   */
  getFavorites() {
    return api.get('/products/favorites');
  }
};