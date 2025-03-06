<template>
    <div v-if="playlist" class="playlist-detail-page container">
      <div class="playlist-header">
        <div class="playlist-image">
          <img 
            v-if="playlist.image_url" 
            :src="playlist.image_url" 
            :alt="playlist.name"
          >
          <div v-else class="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <circle cx="8" cy="10" r="2"></circle>
              <polyline points="20 20 20 14 16 10"></polyline>
            </svg>
          </div>
        </div>
        
        <div class="playlist-info">
          <h1>{{ playlist.name }}</h1>
          
          <div class="playlist-metadata">
            <div class="metadata-item">
              <span class="label">Жанр:</span>
              <span class="value">{{ playlist.genre_name }}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Тип тренировки:</span>
              <span class="value">{{ playlist.workout_type }}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Интенсивность:</span>
              <span class="value">{{ playlist.intensity }}</span>
            </div>
            <div class="metadata-item">
              <span class="label">BPM:</span>
              <span class="value">{{ playlist.bpm }}</span>
            </div>
          </div>
          
          <div class="playlist-description">
            <p>{{ playlist.description || 'Описание отсутствует' }}</p>
          </div>
          
          <div class="playlist-actions">
            <button 
              v-if="isLoggedIn" 
              @click="toggleFavorite"
              class="btn btn-outline favorite-button"
              :class="{ 'is-favorite': isFavorite }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {{ isFavorite ? 'Удалить из избранного' : 'Добавить в избранное' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="playlist-tracks">
        <h2>Треки плейлиста ({{ playlist.tracks.length }})</h2>
        
        <div class="tracks-list">
          <div 
            v-for="(track, index) in playlist.tracks" 
            :key="track.id" 
            class="track-item"
            :class="{ 'active': currentTrackIndex === index }"
            @click="playTrack(index)"
          >
            <div class="track-number">{{ index + 1 }}</div>
            <div class="track-info">
              <div class="track-name">{{ track.title }}</div>
              <div class="track-artist">{{ track.artist }}</div>
            </div>
            <div class="track-duration">{{ formatTime(track.duration) }}</div>
            <div class="track-bpm">{{ track.bpm }} BPM</div>
          </div>
        </div>
      </div>
      
      <MusicPlayer 
        v-if="playlist.tracks.length > 0" 
        :initial-playlist="playlist" 
      />
    </div>
    
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка плейлиста...</p>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute } from 'vue-router'
  import { formatTime } from '@/utils/formatters'
  import MusicPlayer from '@/components/playlists/MusicPlayer.vue'
  
  export default {
    name: 'PlaylistDetailPage',
    components: {
      MusicPlayer
    },
    
    props: {
      id: {
        type: [String, Number],
        required: true
      }
    },
    
    setup(props) {
      const store = useStore()
      const route = useRoute()
      
      // Получаем ID плейлиста из маршрута или пропсов
      const playlistId = ref(props.id || route.params.id)
      
      // Получаем плейлист из состояния Vuex
      const playlist = computed(() => store.state.playlists.currentPlaylist)
      
      // Индекс текущего трека
      const currentTrackIndex = computed(() => store.state.playlists.currentTrackIndex)
      
      // Статус авторизации
      const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
      
      // Статус избранного
      const isFavorite = computed(() => 
        store.getters['playlists/isPlaylistFavorite'](playlistId.value)
      )
      
      // Загрузка плейлиста при монтировании компонента
      onMounted(async () => {
        try {
          await store.dispatch('playlists/fetchPlaylistById', playlistId.value)
        } catch (error) {
          // Обработка ошибки через глобальный обработчик в store
          store.dispatch('app/showNotification', {
            type: 'error',
            message: 'Не удалось загрузить плейлист'
          })
        }
      })
      
      // Добавление/удаление из избранного
      const toggleFavorite = async () => {
        try {
          if (isFavorite.value) {
            await store.dispatch('playlists/removeFromFavorites', playlistId.value)
          } else {
            await store.dispatch('playlists/addToFavorites', playlistId.value)
          }
        } catch (error) {
          // Обработка ошибки через глобальный обработчик в store
        }
      }
      
      // Воспроизведение трека
      const playTrack = (index) => {
        store.dispatch('playlists/playTrack', index)
      }
      
      return {
        playlist,
        currentTrackIndex,
        isLoggedIn,
        isFavorite,
        formatTime,
        toggleFavorite,
        playTrack
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .playlist-detail-page {
    padding: var(--spacing-xl) 0;
    position: relative;
  }
  
  .playlist-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .playlist-image {
    position: relative;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    
    img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }
    
    .image-placeholder {
      width: 100%;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }
  }
  
  .playlist-info {
    display: flex;
    flex-direction: column;
    
    h1 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
    }
  }
  
  .playlist-metadata {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    
    .metadata-item {
      background-color: var(--bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      
      .label {
        display: block;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-sm);
      }
      
      .value {
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
    }
  }
  
  .playlist-description {
    margin-bottom: var(--spacing-lg);
    
    p {
      color: var(--text-secondary);
      line-height: var(--line-height-loose);
    }
  }
  
  .playlist-actions {
    margin-top: auto;
    
    .favorite-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      width: 100%;
      
      svg {
        transition: color var(--transition-fast);
      }
      
      &.is-favorite {
        color: var(--accent-primary);
        
        svg {
          fill: var(--accent-primary);
        }
      }
    }
  }
  
  .playlist-tracks {
    margin-bottom: var(--spacing-xxl);
    
    h2 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }
    
    .tracks-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    
    .track-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm);
      background-color: var(--bg-secondary);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      
      &:hover {
        background-color: var(--bg-tertiary);
      }
      
      &.active {
        background: rgba(252, 53, 101, 0.1);
        border-left: 3px solid var(--accent-primary);
      }
      
      .track-number {
        width: 40px;
        text-align: center;
        color: var(--text-secondary);
        margin-right: var(--spacing-md);
      }
      
      .track-info {
        flex: 1;
        
        .track-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
        
        .track-artist {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
      }
      
      .track-duration,
      .track-bpm {
        width: 80px;
        text-align: right;
        color: var(--text-tertiary);
        font-size: var(--font-size-sm);
      }
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--bg-tertiary);
      border-radius: 50%;
      border-top-color: var(--accent-primary);
      animation: spin 1s linear infinite;
      margin-bottom: var(--spacing-md);
    }
    
    p {
      color: var(--text-secondary);
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>