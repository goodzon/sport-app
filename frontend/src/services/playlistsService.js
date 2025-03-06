import api from './api';

export default {
  /**
   * Получение всех плейлистов с фильтрацией и пагинацией
   * @param {Object} params - Параметры запроса
   * @returns {Promise}
   */
  getPlaylists(params = {}) {
    const queryString = api.buildQueryParams(params);
    return api.get(`/playlists?${queryString}`);
  },

  /**
   * Получение плейлиста по ID
   * @param {Number} id - ID плейлиста
   * @returns {Promise}
   */
  getPlaylistById(id) {
    return api.get(`/playlists/${id}`);
  },

  /**
   * Получение всех жанров музыки
   * @returns {Promise}
   */
  getGenres() {
    return api.get('/playlists/genres');
  },

  /**
   * Получение плейлистов по жанру
   * @param {String} slug - Slug жанра
   * @param {Object} params - Параметры запроса (пагинация, фильтры)
   * @returns {Promise}
   */
  getPlaylistsByGenre(slug, params = {}) {
    const queryString = api.buildQueryParams(params);
    return api.get(`/playlists/genre/${slug}?${queryString}`);
  },

  /**
   * Поиск плейлистов по тексту
   * @param {String} query - Поисковый запрос
   * @param {Object} params - Параметры запроса (пагинация, фильтры)
   * @returns {Promise}
   */
  searchPlaylists(query, params = {}) {
    const queryParams = {
      ...params,
      query
    };
    const queryString = api.buildQueryParams(queryParams);
    return api.get(`/playlists/search?${queryString}`);
  },

  /**
   * Добавление плейлиста в избранное
   * @param {Number} playlistId - ID плейлиста
   * @returns {Promise}
   */
  addToFavorites(playlistId) {
    return api.post(`/playlists/favorite/${playlistId}`);
  },

  /**
   * Удаление плейлиста из избранного
   * @param {Number} playlistId - ID плейлиста
   * @returns {Promise}
   */
  removeFromFavorites(playlistId) {
    return api.delete(`/playlists/favorite/${playlistId}`);
  },

  /**
   * Получение избранных плейлистов пользователя
   * @returns {Promise}
   */
  getFavorites() {
    return api.get('/playlists/favorites');
  }
};