import playlistsService from '@/services/playlistsService';

export default {
  namespaced: true,
  
  state: {
    // Список плейлистов
    items: [],
    
    // Общее количество плейлистов (для пагинации)
    totalItems: 0,
    
    // Текущий плейлист
    currentPlaylist: null,
    
    // Жанры музыки
    genres: [],
    
    // Избранные плейлисты
    favorites: [],
    
    // Текущий трек
    currentTrack: null,
    currentTrackIndex: -1,
    
    // Статус плеера
    playerStatus: {
      isPlaying: false,
      isLooping: false,
      isShuffle: false,
      volume: 0.7,
      duration: 0,
      currentTime: 0
    },
    
    // Статус загрузки
    loading: false,
    loadingGenres: false,
    loadingFavorites: false,
    
    // Сообщение об ошибке
    error: null
  },
  
  getters: {
    // Получение плейлистов
    getPlaylists: (state) => state.items,
    
    // Получение текущего плейлиста
    getCurrentPlaylist: (state) => state.currentPlaylist,
    
    // Получение жанров
    getGenres: (state) => state.genres,
    
    // Получение избранных плейлистов
    getFavorites: (state) => state.favorites,
    
    // Проверка, находится ли плейлист в избранном
    isPlaylistFavorite: (state) => (playlistId) => {
      return state.favorites.some(playlist => playlist.id === playlistId);
    },
    
    // Получение жанра по slug
    getGenreBySlug: (state) => (slug) => {
      return state.genres.find(genre => genre.slug === slug);
    },
    
    // Получение имени жанра по slug
    getGenreNameBySlug: (state, getters) => (slug) => {
      const genre = getters.getGenreBySlug(slug);
      return genre ? genre.name : 'Жанр';
    },
    
    // Получение текущего трека
    getCurrentTrack: (state) => {
      if (!state.currentPlaylist || !state.currentPlaylist.tracks || state.currentTrackIndex < 0) {
        return null;
      }
      return state.currentPlaylist.tracks[state.currentTrackIndex];
    },
    
    // Получение статуса плеера
    getPlayerStatus: (state) => state.playerStatus,
    
    // Проверка, есть ли следующий трек
    hasNextTrack: (state) => {
      if (!state.currentPlaylist || !state.currentPlaylist.tracks) {
        return false;
      }
      return state.currentTrackIndex < state.currentPlaylist.tracks.length - 1;
    },
    
    // Проверка, есть ли предыдущий трек
    hasPrevTrack: (state) => {
      if (!state.currentPlaylist || !state.currentPlaylist.tracks) {
        return false;
      }
      return state.currentTrackIndex > 0;
    }
  },
  
  mutations: {
    // Установка плейлистов
    SET_PLAYLISTS(state, { playlists, totalItems }) {
      state.items = playlists;
      state.totalItems = totalItems;
    },
    
    // Установка текущего плейлиста
    SET_CURRENT_PLAYLIST(state, playlist) {
      state.currentPlaylist = playlist;
    },
    
    // Установка жанров
    SET_GENRES(state, genres) {
      state.genres = genres;
    },
    
    // Установка избранных плейлистов
    SET_FAVORITES(state, playlists) {
      state.favorites = playlists;
    },
    
    // Добавление плейлиста в избранное
    ADD_TO_FAVORITES(state, playlist) {
      if (!state.favorites.some(p => p.id === playlist.id)) {
        state.favorites.push(playlist);
      }
      
      // Если это текущий плейлист, обновляем статус избранного
      if (state.currentPlaylist && state.currentPlaylist.id === playlist.id) {
        state.currentPlaylist.isFavorite = true;
      }
    },
    
    // Удаление плейлиста из избранного
    REMOVE_FROM_FAVORITES(state, playlistId) {
      state.favorites = state.favorites.filter(playlist => playlist.id !== playlistId);
      
      // Если это текущий плейлист, обновляем статус избранного
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        state.currentPlaylist.isFavorite = false;
      }
    },
    
    // Установка текущего трека
    SET_CURRENT_TRACK(state, index) {
      state.currentTrackIndex = index;
    },
    
    // Установка статуса плеера
    SET_PLAYER_STATUS(state, status) {
      state.playerStatus = {
        ...state.playerStatus,
        ...status
      };
    },
    
    // Установка статуса загрузки
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    
    // Установка статуса загрузки жанров
    SET_LOADING_GENRES(state, isLoading) {
      state.loadingGenres = isLoading;
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
    // Получение плейлистов
    async fetchPlaylists({ commit, dispatch }, params = {}) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await playlistsService.getPlaylists(params);
        
        commit('SET_PLAYLISTS', {
          playlists: response.data,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке плейлистов');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение плейлиста по ID
    async fetchPlaylistById({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await playlistsService.getPlaylistById(id);
        
        commit('SET_CURRENT_PLAYLIST', response.data);
        
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке плейлиста');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение плейлистов по жанру
    async fetchPlaylistsByGenre({ commit, dispatch }, { slug, params = {} }) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await playlistsService.getPlaylistsByGenre(slug, params);
        
        commit('SET_PLAYLISTS', {
          playlists: response.data.playlists,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке плейлистов жанра');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Поиск плейлистов
    async searchPlaylists({ commit, dispatch }, { query, params = {} }) {
      try {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');
        
        const response = await playlistsService.searchPlaylists(query, params);
        
        commit('SET_PLAYLISTS', {
          playlists: response.data,
          totalItems: response.meta.total
        });
        
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при поиске плейлистов');
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получение жанров музыки
    async fetchGenres({ commit, dispatch }) {
      try {
        commit('SET_LOADING_GENRES', true);
        
        const response = await playlistsService.getGenres();
        
        commit('SET_GENRES', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке жанров:', error);
        dispatch('app/showError', error, { root: true });
        throw error;
      } finally {
        commit('SET_LOADING_GENRES', false);
      }
    },
    
    // Получение избранных плейлистов
    async fetchFavorites({ commit, dispatch, rootState }) {
      try {
        // Проверяем, авторизован ли пользователь
        if (!rootState.auth.isLoggedIn) {
          return [];
        }
        
        commit('SET_LOADING_FAVORITES', true);
        
        const response = await playlistsService.getFavorites();
        
        commit('SET_FAVORITES', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке избранных плейлистов:', error);
        throw error;
      } finally {
        commit('SET_LOADING_FAVORITES', false);
      }
    },
    
    // Добавление плейлиста в избранное
    async addToFavorites({ commit, dispatch, state }, playlistId) {
      try {
        await playlistsService.addToFavorites(playlistId);
        
        // Если у нас есть информация о плейлисте в текущем списке
        const playlist = state.items.find(p => p.id === playlistId) || state.currentPlaylist;
        
        if (playlist) {
          commit('ADD_TO_FAVORITES', playlist);
        } else {
          // Если нет, загружаем информацию о плейлисте
          const response = await playlistsService.getPlaylistById(playlistId);
          commit('ADD_TO_FAVORITES', response.data);
        }
        
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Плейлист добавлен в избранное'
        }, { root: true });
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при добавлении в избранное'
        }, { root: true });
        throw error;
      }
    },
    
    // Удаление плейлиста из избранного
    async removeFromFavorites({ commit, dispatch }, playlistId) {
      try {
        await playlistsService.removeFromFavorites(playlistId);
        
        commit('REMOVE_FROM_FAVORITES', playlistId);
        
        dispatch('app/showNotification', {
          type: 'success',
          message: 'Плейлист удален из избранного'
        }, { root: true });
      } catch (error) {
        dispatch('app/showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'Ошибка при удалении из избранного'
        }, { root: true });
        throw error;
      }
    },
    
    // Воспроизведение трека
    playTrack({ commit, state }, index) {
      if (!state.currentPlaylist || !state.currentPlaylist.tracks || index >= state.currentPlaylist.tracks.length) {
        return;
      }
      
      commit('SET_CURRENT_TRACK', index);
      commit('SET_PLAYER_STATUS', { 
        isPlaying: true,
        currentTime: 0
      });
    },
    
    // Управление плеером
    updatePlayerStatus({ commit }, status) {
      commit('SET_PLAYER_STATUS', status);
    },
    
    // Переключение на следующий трек
    nextTrack({ commit, state, getters }) {
      if (!getters.hasNextTrack) {
        // Если треков больше нет, можем зациклить или остановить воспроизведение
        if (state.playerStatus.isLooping) {
          commit('SET_CURRENT_TRACK', 0);
        } else {
          commit('SET_PLAYER_STATUS', { isPlaying: false });
        }
        return;
      }
      
      // Переходим к следующему треку
      commit('SET_CURRENT_TRACK', state.currentTrackIndex + 1);
      commit('SET_PLAYER_STATUS', { currentTime: 0 });
    },
    
    // Переключение на предыдущий трек
    prevTrack({ commit, state, getters }) {
      if (!getters.hasPrevTrack) {
        // Если это первый трек, начинаем его сначала
        commit('SET_PLAYER_STATUS', { currentTime: 0 });
        return;
      }
      
      // Переходим к предыдущему треку
      commit('SET_CURRENT_TRACK', state.currentTrackIndex - 1);
      commit('SET_PLAYER_STATUS', { currentTime: 0 });
    }
  }
}