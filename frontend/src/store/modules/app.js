// Модуль состояния приложения
export default {
    namespaced: true,
    
    state: {
      // Режим темной темы
      darkMode: true,
      
      // Уведомления
      notifications: [],
      
      // Статус загрузки глобальных данных
      loading: false,
      
      // Ошибки приложения
      error: null,
    },
    
    getters: {
      // Получение статуса темной темы
      isDarkTheme: (state) => state.darkMode,
      
      // Получение всех уведомлений
      getNotifications: (state) => state.notifications,
    },
    
    mutations: {
      // Установка темного режима
      SET_DARK_MODE(state, isDark) {
        state.darkMode = isDark;
      },
      
      // Добавление уведомления
      ADD_NOTIFICATION(state, notification) {
        // Генерируем уникальный ID для уведомления
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        state.notifications.push({
          id,
          type: notification.type || 'info',
          title: notification.title || '',
          message: notification.message,
          timeout: notification.timeout !== undefined ? notification.timeout : 5000
        });
        
        // Если установлен timeout, настраиваем автоматическое удаление
        if (notification.timeout !== 0) {
          setTimeout(() => {
            const index = state.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
              state.notifications.splice(index, 1);
            }
          }, notification.timeout || 5000);
        }
      },
      
      // Удаление уведомления по ID
      REMOVE_NOTIFICATION(state, id) {
        const index = state.notifications.findIndex(notification => notification.id === id);
        if (index !== -1) {
          state.notifications.splice(index, 1);
        }
      },
      
      // Очистка всех уведомлений
      CLEAR_NOTIFICATIONS(state) {
        state.notifications = [];
      },
      
      // Установка состояния загрузки
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
      }
    },
    
    actions: {
      // Инициализация темы
      initTheme({ commit }) {
        // Проверяем сохраненную тему в localStorage
        const savedTheme = localStorage.getItem('darkMode');
        
        if (savedTheme !== null) {
          // Используем сохраненное значение
          commit('SET_DARK_MODE', savedTheme === 'true');
        } else {
          // Проверяем предпочтения системы
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          commit('SET_DARK_MODE', prefersDark);
          localStorage.setItem('darkMode', prefersDark.toString());
        }
        
        // Применяем класс темы к body
        document.documentElement.classList.toggle('dark-theme', !this.state.app.darkMode);
      },
      
      // Переключение темы
      toggleDarkMode({ commit, state }) {
        const newValue = !state.darkMode;
        commit('SET_DARK_MODE', newValue);
        
        // Сохраняем выбор пользователя в localStorage
        localStorage.setItem('darkMode', newValue.toString());
        
        // Применяем класс темы к body
        document.documentElement.classList.toggle('dark-theme', !newValue);
        
        // Если пользователь авторизован, сохраняем настройку в профиле
        if (this.state.auth.isLoggedIn) {
          this.dispatch('auth/updateSettings', { darkMode: newValue });
        }
      },
      
      // Показать уведомление
      showNotification({ commit }, notification) {
        commit('ADD_NOTIFICATION', notification);
      },
      
      // Показать ошибку
      showError({ commit, dispatch }, error) {
        console.error('Error:', error);
        
        // Устанавливаем состояние ошибки
        commit('SET_ERROR', error);
        
        // Показываем уведомление об ошибке
        dispatch('showNotification', {
          type: 'error',
          message: error.message || 'Произошла ошибка. Пожалуйста, попробуйте еще раз позже.',
          timeout: 7000
        });
      },
      
      // Очистить ошибку
      clearError({ commit }) {
        commit('CLEAR_ERROR');
      },
      
      // Установить состояние загрузки
      setLoading({ commit }, isLoading) {
        commit('SET_LOADING', isLoading);
      }
    }
  }