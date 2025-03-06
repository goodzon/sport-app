import authService from '@/services/authService';

export default {
  namespaced: true,
  
  state: {
    // Пользователь и его статус
    user: null,
    isLoggedIn: false,
    token: null,
    
    // Статус загрузки
    loading: false,
    
    // Сообщение об ошибке
    error: null
  },
  
  getters: {
    // Получение пользователя
    getUser: (state) => state.user,
    
    // Проверка аутентификации
    isAuthenticated: (state) => state.isLoggedIn,
    
    // Получение имени пользователя или заглушки
    getUserDisplayName: (state) => {
      if (!state.user) return 'Гость';
      
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName} ${state.user.lastName}`;
      }
      
      return state.user.username;
    },
    
    // Получение аватара пользователя или заглушки
    getUserAvatar: (state) => {
      if (!state.user || !state.user.avatarUrl) {
        return null;
      }
      
      return state.user.avatarUrl;
    },
    
    // Получение инициалов пользователя (для аватара-заглушки)
    getUserInitials: (state) => {
      if (!state.user) return '?';
      
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName.charAt(0)}${state.user.lastName.charAt(0)}`;
      }
      
      return state.user.username.substring(0, 2).toUpperCase();
    }
  },
  
  mutations: {
    // Установка пользователя
    SET_USER(state, user) {
      state.user = user;
      state.isLoggedIn = !!user;
    },
    
    // Установка токена
    SET_TOKEN(state, token) {
      state.token = token;
    },
    
    // Установка статуса загрузки
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    
    // Установка ошибки
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    // Очистка ошибки
    CLEAR_ERROR(state) {
      state.error = null;
    },
    
    // Выход пользователя
    LOGOUT(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
    
    // Обновление настроек пользователя
    UPDATE_USER_SETTINGS(state, settings) {
      if (state.user && state.user.settings) {
        state.user.settings = {
          ...state.user.settings,
          ...settings
        };
      } else if (state.user) {
        state.user.settings = settings;
      }
    },
    
    // Обновление профиля пользователя
    UPDATE_USER_PROFILE(state, userData) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...userData
        };
      }
    }
  },
  
  actions: {
    // Загрузка пользователя из localStorage
    loadUser({ commit, dispatch }) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
          commit('SET_TOKEN', token);
          commit('SET_USER', user);
          
          // Устанавливаем токен в заголовки axios
          authService.setAuthToken(token);
          
          // Применяем настройки пользователя
          if (user.settings && user.settings.darkMode !== undefined) {
            commit('app/SET_DARK_MODE', user.settings.darkMode, { root: true });
          }
          
          // Синхронизируем данные пользователя
          dispatch('fetchUserProfile');
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        dispatch('logout');
      }
    },
    
    // Регистрация пользователя
    async register({ commit, dispatch }, userData) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await authService.register(userData);
        
        // Сохраняем пользователя и токен
        commit('SET_USER', response.user);
        commit('SET_TOKEN', response.token);
        
        // Сохраняем в localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Устанавливаем токен в заголовки axios
        authService.setAuthToken(response.token);
        
        // Показываем уведомление об успешной регистрации
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Вы успешно зарегистрированы!'
        }, { root: true });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при регистрации');
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при регистрации. Пожалуйста, попробуйте позже.'
        }, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Вход пользователя
    async login({ commit, dispatch }, credentials) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await authService.login(credentials);
        
        // Сохраняем пользователя и токен
        commit('SET_USER', response.user);
        commit('SET_TOKEN', response.token);
        
        // Сохраняем в localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Устанавливаем токен в заголовки axios
        authService.setAuthToken(response.token);
        
        // Показываем уведомление об успешном входе
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Вы успешно вошли в систему!'
        }, { root: true });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при входе');
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при входе. Проверьте данные и попробуйте снова.'
        }, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Выход пользователя
    logout({ commit, dispatch }) {
      // Очищаем состояние
      commit('LOGOUT');
      
      // Очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Очищаем заголовок авторизации
      authService.removeAuthToken();
      
      // Показываем уведомление
      dispatch('app/showNotification', {
        type: 'info',
        message: 'Вы вышли из системы'
      }, { root: true });
    },
    
    // Получение профиля пользователя
    async fetchUserProfile({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true);
        
        const response = await authService.getUserProfile();
        
        // Обновляем данные пользователя
        commit('SET_USER', response.user);
        
        // Обновляем localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
      } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        
        // Если токен недействителен, выходим из системы
        if (error.response && error.response.status === 401) {
          dispatch('logout');
        }
        
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Обновление профиля пользователя
    async updateProfile({ commit, dispatch }, userData) {
      try {
        commit('SET_LOADING', true);
        
        const response = await authService.updateProfile(userData);
        
        // Обновляем данные пользователя
        commit('UPDATE_USER_PROFILE', response.user);
        
        // Обновляем localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, ...response.user }));
        
        // Показываем уведомление
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Профиль успешно обновлен'
        }, { root: true });
        
        return response.user;
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при обновлении профиля'
        }, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Обновление пароля пользователя
    async updatePassword({ commit, dispatch }, passwordData) {
      try {
        commit('SET_LOADING', true);
        
        await authService.updatePassword(passwordData);
        
        // Показываем уведомление
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Пароль успешно обновлен'
        }, { root: true });
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при обновлении пароля'
        }, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Обновление настроек пользователя
    async updateSettings({ commit, dispatch }, settings) {
      try {
        commit('SET_LOADING', true);
        
        // Если пользователь авторизован, отправляем настройки на сервер
        if (this.state.auth.isLoggedIn) {
          const response = await authService.updateSettings(settings);
          commit('UPDATE_USER_SETTINGS', response.settings);
          
          // Обновляем localStorage
          const user = JSON.parse(localStorage.getItem('user'));
          user.settings = { ...user.settings, ...response.settings };
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // В любом случае обновляем локальные настройки
        if (settings.darkMode !== undefined) {
          commit('app/SET_DARK_MODE', settings.darkMode, { root: true });
          localStorage.setItem('darkMode', settings.darkMode.toString());
        }
        
        return settings;
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при обновлении настроек'
        }, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
}