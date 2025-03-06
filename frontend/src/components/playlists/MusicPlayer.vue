<template>
    <div class="music-player" :class="{ 'expanded': isExpanded, 'playing': isPlaying }">
      <!-- Мобильная кнопка расширения плеера -->
      <div class="player-toggle" v-if="isMobile" @click="togglePlayer">
        <div class="toggle-icon">
          <svg v-if="!isExpanded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <div class="toggle-text">
          {{ isExpanded ? 'Закрыть' : 'Плеер' }}
        </div>
      </div>
      
      <!-- Главная часть плеера -->
      <div class="player-container">
        <!-- Обложка и информация о треке -->
        <div class="player-info">
          <div class="track-artwork">
            <img 
              v-if="currentTrack && currentTrack.imageUrl" 
              :src="currentTrack.imageUrl" 
              :alt="currentTrack.title"
            >
            <div v-else class="artwork-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            
            <!-- Индикатор проигрывания (на мобильных) -->
            <div v-if="isMobile && isPlaying" class="equalizer">
              <div class="equalizer-bar equalizer-bar-1"></div>
              <div class="equalizer-bar equalizer-bar-2"></div>
              <div class="equalizer-bar equalizer-bar-3"></div>
            </div>
          </div>
          
          <div class="track-details">
            <div class="track-title">
              {{ currentTrack ? currentTrack.title : 'Нет трека' }}
            </div>
            <div class="track-artist">
              {{ currentTrack ? currentTrack.artist : 'Выберите плейлист' }}
            </div>
            
            <!-- Индикатор проигрывания (на десктопе) -->
            <div v-if="!isMobile && isPlaying" class="sound-wave">
              <div class="sound-wave-bar" v-for="n in 5" :key="n"></div>
            </div>
          </div>
        </div>
        
        <!-- Контролы плеера -->
        <div class="player-controls">
          <button 
            class="control-button" 
            @click="previousTrack" 
            :disabled="!currentTrack || currentPlaylist.tracks.length <= 1"
            aria-label="Предыдущий трек"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          
          <button 
            class="control-button play-button" 
            @click="togglePlay" 
            :disabled="!currentTrack"
            :aria-label="isPlaying ? 'Пауза' : 'Воспроизвести'"
          >
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          
          <button 
            class="control-button" 
            @click="nextTrack" 
            :disabled="!currentTrack || currentPlaylist.tracks.length <= 1"
            aria-label="Следующий трек"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>
        
        <!-- Прогресс и громкость (для десктопа) -->
        <div class="player-progress-volume" v-if="!isMobile">
          <div class="track-progress">
            <span class="time current-time">{{ formatTime(currentTime) }}</span>
            <div 
              class="progress-bar" 
              ref="progressBar"
              @click="seekTrack"
            >
              <div class="progress-track"></div>
              <div class="progress-current" :style="{ width: `${progressPercentage}%` }"></div>
              <div class="progress-handle" :style="{ left: `${progressPercentage}%` }"></div>
            </div>
            <span class="time total-time">{{ formatTime(duration) }}</span>
          </div>
          
          <div class="volume-control">
            <button 
              class="volume-button" 
              @click="toggleMute"
              :aria-label="isMuted ? 'Включить звук' : 'Выключить звук'"
            >
              <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
              <svg v-else-if="volume < 0.5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            
            <div 
              class="volume-slider"
              ref="volumeSlider"
              @click="changeVolume"
            >
              <div class="volume-track"></div>
              <div class="volume-current" :style="{ width: `${volumePercentage}%` }"></div>
              <div class="volume-handle" :style="{ left: `${volumePercentage}%` }"></div>
            </div>
          </div>
        </div>
        
        <!-- Прогресс (для мобильных) -->
        <div class="mobile-progress" v-if="isMobile && isExpanded">
          <div class="track-progress">
            <span class="time current-time">{{ formatTime(currentTime) }}</span>
            <div 
              class="progress-bar" 
              ref="progressBar"
              @click="seekTrack"
            >
              <div class="progress-track"></div>
              <div class="progress-current" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
            <span class="time total-time">{{ formatTime(duration) }}</span>
          </div>
        </div>
        
        <!-- Информация о тренировке -->
        <div class="workout-info" v-if="isExpanded">
          <div class="workout-type">
            <span class="info-label">Тип тренировки:</span>
            <span class="info-value">{{ currentPlaylist.workoutType || 'Не указан' }}</span>
          </div>
          <div class="workout-intensity">
            <span class="info-label">Интенсивность:</span>
            <span class="info-value">{{ currentPlaylist.intensity || 'Не указана' }}</span>
          </div>
          <div class="workout-bpm">
            <span class="info-label">BPM:</span>
            <span class="info-value">{{ currentTrack ? currentTrack.bpm : '-' }}</span>
          </div>
        </div>
        
        <!-- Список треков (для десктопа или при расширенном мобильном виде) -->
        <div class="playlist-tracks" v-if="isExpanded && currentPlaylist.tracks.length > 0">
          <h3 class="playlist-title">{{ currentPlaylist.name }}</h3>
          
          <div class="tracks-list">
            <div 
              v-for="(track, index) in currentPlaylist.tracks" 
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { useStore } from 'vuex'
  
  export default {
    name: 'MusicPlayer',
    
    props: {
      // Исходное состояние расширения плеера
      initialExpanded: {
        type: Boolean,
        default: false
      }
    },
    
    setup(props) {
      const store = useStore()
      
      // Проверка на мобильное устройство
      const isMobile = ref(window.innerWidth < 768)
      const isExpanded = ref(props.initialExpanded)
      
      // Ссылки на DOM-элементы
      const progressBar = ref(null)
      const volumeSlider = ref(null)
      
      // Состояние аудио
      const isPlaying = ref(false)
      const isMuted = ref(false)
      const volume = ref(0.7) // 0-1
      const currentTime = ref(0)
      const duration = ref(0)
      const audio = ref(null)
      
      // Текущий трек и плейлист
      const currentTrackIndex = ref(0)
      
      // Мок-данные для примера (в реальном приложении будут из store)
      const currentPlaylist = ref({
        id: 1,
        name: 'Интенсивная тренировка',
        workoutType: 'Кардио',
        intensity: 'Высокая',
        tracks: [
          {
            id: 1,
            title: 'Power Workout',
            artist: 'Fitness Beats',
            duration: 187,
            bpm: 145,
            audioUrl: 'https://example.com/audio/track1.mp3',
            imageUrl: 'https://via.placeholder.com/400'
          },
          {
            id: 2,
            title: 'Running High',
            artist: 'Cardio Kings',
            duration: 214,
            bpm: 160,
            audioUrl: 'https://example.com/audio/track2.mp3',
            imageUrl: 'https://via.placeholder.com/400'
          },
          {
            id: 3,
            title: 'Energy Boost',
            artist: 'Workout Masters',
            duration: 198,
            bpm: 150,
            audioUrl: 'https://example.com/audio/track3.mp3',
            imageUrl: 'https://via.placeholder.com/400'
          }
        ]
      })
      
      // Текущий трек
      const currentTrack = computed(() => {
        if (currentPlaylist.value.tracks.length === 0) return null
        return currentPlaylist.value.tracks[currentTrackIndex.value]
      })
      
      // Процент прогресса воспроизведения
      const progressPercentage = computed(() => {
        if (duration.value === 0) return 0
        return (currentTime.value / duration.value) * 100
      })
      
      // Процент громкости
      const volumePercentage = computed(() => {
        return volume.value * 100
      })
      
      // Инициализация аудио-элемента
      const initAudio = () => {
        audio.value = new Audio()
        
        // Обработчики событий
        audio.value.addEventListener('timeupdate', updateProgress)
        audio.value.addEventListener('ended', handleTrackEnd)
        audio.value.addEventListener('canplay', onCanPlay)
        audio.value.addEventListener('loadedmetadata', onLoadedMetadata)
        audio.value.addEventListener('error', onAudioError)
        
        // Установка громкости
        audio.value.volume = volume.value
      }
      
      // Установка трека
      const setTrack = (index) => {
        if (index < 0 || index >= currentPlaylist.value.tracks.length) return
        
        currentTrackIndex.value = index
        const track = currentPlaylist.value.tracks[index]
        
        // Сбрасываем текущее время и прогресс
        currentTime.value = 0
        duration.value = track.duration || 0
        
        // Устанавливаем источник аудио
        if (audio.value) {
          audio.value.src = track.audioUrl
          audio.value.load()
        }
      }
      
      // Воспроизведение трека
      const playTrack = (index) => {
        if (index !== currentTrackIndex.value) {
          setTrack(index)
        }
        
        play()
      }
      
      // Воспроизведение
      const play = () => {
        if (!audio.value || !currentTrack.value) return
        
        audio.value.play()
          .then(() => {
            isPlaying.value = true
          })
          .catch(error => {
            console.error('Ошибка воспроизведения:', error)
          })
      }
      
      // Пауза
      const pause = () => {
        if (!audio.value) return
        
        audio.value.pause()
        isPlaying.value = false
      }
      
      // Переключение воспроизведения/паузы
      const togglePlay = () => {
        if (isPlaying.value) {
          pause()
        } else {
          play()
        }
      }
      
      // Предыдущий трек
      const previousTrack = () => {
        let index = currentTrackIndex.value - 1
        if (index < 0) {
          index = currentPlaylist.value.tracks.length - 1
        }
        
        playTrack(index)
      }
      
      // Следующий трек
      const nextTrack = () => {
        let index = currentTrackIndex.value + 1
        if (index >= currentPlaylist.value.tracks.length) {
          index = 0
        }
        
        playTrack(index)
      }
      
      // Обработка окончания трека
      const handleTrackEnd = () => {
        // Переход к следующему треку
        nextTrack()
      }
      
      // Обновление прогресса
      const updateProgress = () => {
        if (!audio.value) return
        
        currentTime.value = audio.value.currentTime
      }
      
      // Обработка события canplay
      const onCanPlay = () => {
        if (isPlaying.value) {
          play()
        }
      }
      
      // Обработка события loadedmetadata
      const onLoadedMetadata = () => {
        if (!audio.value) return
        
        duration.value = audio.value.duration
      }
      
      // Обработка ошибок аудио
      const onAudioError = (error) => {
        console.error('Ошибка аудио:', error)
        
        // Уведомление пользователя об ошибке
        store.dispatch('app/showNotification', {
          type: 'error',
          message: 'Не удалось загрузить аудио. Попробуйте позже.'
        })
        
        // Останавливаем воспроизведение
        isPlaying.value = false
      }
      
      // Перемотка трека
      const seekTrack = (event) => {
        if (!progressBar.value || !audio.value) return
        
        const rect = progressBar.value.getBoundingClientRect()
        const offsetX = event.clientX - rect.left
        const percentage = offsetX / rect.width
        
        audio.value.currentTime = percentage * duration.value
        currentTime.value = audio.value.currentTime
      }
      
      // Изменение громкости
      const changeVolume = (event) => {
        if (!volumeSlider.value) return
        
        const rect = volumeSlider.value.getBoundingClientRect()
        const offsetX = event.clientX - rect.left
        const percentage = offsetX / rect.width
        
        volume.value = Math.max(0, Math.min(1, percentage))
        
        if (audio.value) {
          audio.value.volume = volume.value
        }
        
        // Если громкость увеличивается с нуля, сбрасываем флаг mute
        if (volume.value > 0 && isMuted.value) {
          isMuted.value = false
        } else if (volume.value === 0) {
          isMuted.value = true
        }
      }
      
      // Переключение приглушения звука
      const toggleMute = () => {
        isMuted.value = !isMuted.value
        
        if (audio.value) {
          if (isMuted.value) {
            audio.value.volume = 0
          } else {
            audio.value.volume = volume.value
          }
        }
      }
      
      // Форматирование времени (секунды -> MM:SS)
      const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '00:00'
        
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      }
      
      // Переключение расширенного режима плеера
      const togglePlayer = () => {
        isExpanded.value = !isExpanded.value
      }
      
      // Обработчик изменения размера окна
      const handleResize = () => {
        isMobile.value = window.innerWidth < 768
      }
      
      // Хуки жизненного цикла
      onMounted(() => {
        // Инициализация аудио
        initAudio()
        
        // Установка первого трека
        if (currentPlaylist.value.tracks.length > 0) {
          setTrack(0)
        }
        
        // Слушатель изменения размера окна
        window.addEventListener('resize', handleResize)
      })
      
      onBeforeUnmount(() => {
        // Удаление обработчиков событий аудио
        if (audio.value) {
          audio.value.removeEventListener('timeupdate', updateProgress)
          audio.value.removeEventListener('ended', handleTrackEnd)
          audio.value.removeEventListener('canplay', onCanPlay)
          audio.value.removeEventListener('loadedmetadata', onLoadedMetadata)
          audio.value.removeEventListener('error', onAudioError)
          
          // Остановка воспроизведения
          audio.value.pause()
          audio.value.src = ''
        }
        
        // Удаление слушателя изменения размера окна
        window.removeEventListener('resize', handleResize)
      })
      
      return {
        isMobile,
        isExpanded,
        isPlaying,
        isMuted,
        volume,
        currentTime,
        duration,
        progressBar,
        volumeSlider,
        currentTrackIndex,
        currentTrack,
        currentPlaylist,
        progressPercentage,
        volumePercentage,
        playTrack,
        togglePlay,
        previousTrack,
        nextTrack,
        seekTrack,
        changeVolume,
        toggleMute,
        formatTime,
        togglePlayer
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .music-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--bg-tertiary);
    z-index: var(--z-index-fixed);
    transition: all var(--transition-normal);
    
    &.expanded {
      height: 400px;
      
      @media (max-width: $breakpoint-sm) {
        height: 70vh;
      }
    }
    
    &.playing {
      .track-artwork {
        img {
          animation: rotate 20s linear infinite;
        }
      }
    }
  }
  
  .player-toggle {
    position: absolute;
    top: -50px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: var(--border-radius-circle);
    background: var(--gradient-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    
    .toggle-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toggle-text {
      font-size: var(--font-size-xs);
      margin-top: 2px;
    }
  }
  
  .player-container {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-md);
    height: 90px; // Высота в свернутом состоянии
    overflow: hidden;
    transition: height var(--transition-normal);
    
    .expanded & {
      height: 100%;
      overflow-y: auto;
      
      @media (min-width: $breakpoint-md) {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  }
  
  .player-info {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    
    .expanded & {
      @media (min-width: $breakpoint-md) {
        width: 300px;
        flex-direction: column;
        align-items: flex-start;
        padding-right: var(--spacing-lg);
      }
    }
  }
  
  .track-artwork {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    margin-right: var(--spacing-md);
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
    }
    
    .artwork-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
      color: var(--text-tertiary);
    }
    
    .equalizer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0 var(--spacing-xs);
      
      .equalizer-bar {
        width: 3px;
        background-color: var(--accent-primary);
        margin: 0 1px;
      }
    }
    
    .expanded & {
      @media (min-width: $breakpoint-md) {
        width: 280px;
        height: 280px;
        margin-right: 0;
        margin-bottom: var(--spacing-md);
      }
    }
  }
  
  .track-details {
    flex: 1;
    min-width: 0;
    
    .track-title {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .track-artist {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .sound-wave {
      display: flex;
      align-items: flex-end;
      height: 14px;
      margin-top: var(--spacing-xs);
      
      .sound-wave-bar {
        height: 14px;
        width: 3px;
        background-color: var(--accent-primary);
        margin-right: 2px;
        border-radius: var(--border-radius-sm);
      }
    }
  }
  
  .player-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-md);
    margin-left: auto;
    
    .expanded & {
      @media (min-width: $breakpoint-md) {
        flex: 1;
        margin-left: 0;
        padding: 0 var(--spacing-xl);
      }
      
      @media (max-width: $breakpoint-md) {
        margin: var(--spacing-md) 0;
      }
    }
    
    .control-button {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-circle);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      transition: all var(--transition-fast);
      margin: 0 var(--spacing-xs);
      
      &:hover:not(:disabled) {
        background-color: var(--bg-elevated);
        transform: scale(1.05);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &.play-button {
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        
        &:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 0 15px var(--accent-primary);
        }
      }
    }
  }
  
  .player-progress-volume {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: var(--spacing-lg);
    
    .expanded & {
      @media (min-width: $breakpoint-md) {
        width: 100%;
        margin-left: 0;
        margin-top: var(--spacing-lg);
        order: 3;
      }
    }
  }
  
  .track-progress {
    display: flex;
    align-items: center;
    
    .time {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      width: 45px;
      
      &.current-time {
        text-align: right;
      }
      
      &.total-time {
        text-align: left;
      }
    }
    
    .progress-bar {
      flex: 1;
      height: 4px;
      background-color: var(--bg-tertiary);
      border-radius: var(--border-radius-sm);
      margin: 0 var(--spacing-sm);
      position: relative;
      cursor: pointer;
      
      .progress-track {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius-sm);
        background-color: var(--bg-tertiary);
      }
      
      .progress-current {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: var(--border-radius-sm);
        background: var(--gradient-primary);
      }
      
      .progress-handle {
        position: absolute;
        top: 50%;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--accent-primary);
        transform: translate(-50%, -50%);
        box-shadow: var(--shadow-sm);
        opacity: 0;
        transition: opacity var(--transition-fast);
      }
      
      &:hover .progress-handle {
        opacity: 1;
      }
    }
  }
  
  .volume-control {
    display: flex;
    align-items: center;
    margin-top: var(--spacing-sm);
    
    .volume-button {
      background: none;
      border: none;
      color: var(--text-secondary);
      padding: var(--spacing-xs);
      transition: color var(--transition-fast);
      
      &:hover {
        color: var(--text-primary);
      }
    }
    
    .volume-slider {
      flex: 1;
      max-width: 100px;
      height: 4px;
      background-color: var(--bg-tertiary);
      border-radius: var(--border-radius-sm);
      margin-left: var(--spacing-xs);
      position: relative;
      cursor: pointer;
      
      .volume-track {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius-sm);
        background-color: var(--bg-tertiary);
      }
      
      .volume-current {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: var(--border-radius-sm);
        background-color: var(--accent-primary);
      }
      
      .volume-handle {
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--accent-primary);
        transform: translate(-50%, -50%);
        box-shadow: var(--shadow-sm);
        opacity: 0;
        transition: opacity var(--transition-fast);
      }
      
      &:hover .volume-handle {
        opacity: 1;
      }
    }
  }
  
  .mobile-progress {
    padding: var(--spacing-md) 0;
  }
  
  .workout-info {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    border-top: 1px solid var(--bg-tertiary);
    margin-top: var(--spacing-md);
    
    @media (min-width: $breakpoint-md) {
      width: 100%;
      order: 2;
    }
    
    .info-label {
      color: var(--text-tertiary);
      margin-right: var(--spacing-xs);
      font-size: var(--font-size-sm);
    }
    
    .info-value {
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }
  }
  
  .playlist-tracks {
    width: 100%;
    margin-top: var(--spacing-md);
    
    @media (min-width: $breakpoint-md) {
      order: 4;
    }
    
    .playlist-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-md);
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
      border-radius: var(--border-radius-md);
      background-color: var(--bg-tertiary);
      transition: background-color var(--transition-fast);
      cursor: pointer;
      
      &:hover {
        background-color: var(--bg-elevated);
      }
      
      &.active {
        background-color: rgba(252, 53, 101, 0.1);
        border-left: 3px solid var(--accent-primary);
      }
      
      .track-number {
        width: 30px;
        text-align: center;
        font-weight: var(--font-weight-bold);
        color: var(--text-tertiary);
        
        .active & {
          color: var(--accent-primary);
        }
      }
      
      .track-info {
        flex: 1;
        min-width: 0;
        
        .track-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .track-artist {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .track-duration {
        margin-left: var(--spacing-md);
        color: var(--text-tertiary);
        font-size: var(--font-size-sm);
      }
    }
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>