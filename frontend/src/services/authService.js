import api from './api';

export default {
  // Экспортируем функции для работы с токеном
  setAuthToken: api.setAuthToken,
  removeAuthToken: api.removeAuthToken,

  /**
   * Регистрация нового пользователя
   * @param {Object} userData - Данные нового пользователя
   * @returns {Promise}
   */
  register(userData) {
    return api.post('/auth/register', userData);
  },

  /**
   * Вход пользователя
   * @param {Object} credentials - Учетные данные пользователя (email, password)
   * @returns {Promise}
   */
  login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Получение профиля текущего пользователя
   * @returns {Promise}
   */
  getUserProfile() {
    return api.get('/auth/me');
  },

  /**
   * Обновление профиля пользователя
   * @param {Object} userData - Данные для обновления профиля
   * @returns {Promise}
   */
  updateProfile(userData) {
    return api.put('/auth/profile', userData);
  },

  /**
   * Обновление пароля пользователя
   * @param {Object} passwordData - Данные для обновления пароля
   * @returns {Promise}
   */
  updatePassword(passwordData) {
    return api.put('/auth/password', passwordData);
  },

  /**
   * Обновление настроек пользователя
   * @param {Object} settings - Настройки пользователя
   * @returns {Promise}
   */
  updateSettings(settings) {
    return api.put('/auth/settings', settings);
  }
};