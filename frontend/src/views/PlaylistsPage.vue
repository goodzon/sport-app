<template>
    <div class="playlists-page container">
      <div class="page-header">
        <h1 class="page-title">Музыкальные плейлисты для тренировок</h1>
        
        <!-- Мобильные кнопки -->
        <div class="mobile-actions" v-if="isMobile">
          <button 
            class="btn btn-secondary filter-toggle" 
            @click="isMobileFiltersOpen = true"
            aria-label="Фильтры"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            <span>Фильтры</span>
          </button>
        </div>
      </div>
      
      <!-- Фильтры и плейлисты -->
      <div class="main-content">
        <!-- Боковая панель с фильтрами (десктоп) -->
        <aside class="sidebar" v-if="!isMobile">
          <div class="filter-section">
            <h3 class="filter-title">Жанры музыки</h3>
            <div class="filter-options">
              <label class="filter-option" v-for="genre in genres" :key="genre.id">
                <input type="checkbox" v-model="selectedGenres" :value="genre.id">
                <span class="option-label">{{ genre.name }}</span>
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">Тип тренировки</h3>
            <div class="filter-options">
              <label class="filter-option" v-for="type in workoutTypes" :key="type.value">
                <input type="checkbox" v-model="selectedWorkoutTypes" :value="type.value">
                <span class="option-label">{{ type.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">Интенсивность</h3>
            <div class="filter-options">
              <label class="filter-option" v-for="intensity in intensityLevels" :key="intensity.value">
                <input type="checkbox" v-model="selectedIntensities" :value="intensity.value">
                <span class="option-label">{{ intensity.label }}</span>
              </label>
            </div>
          </div>
        </aside>
        
        <!-- Список плейлистов -->
        <main class="playlists-container">
          <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Загрузка плейлистов...</p>
          </div>
          
          <div v-else-if="playlists.length === 0" class="empty-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>Плейлисты не найдены</p>
            <button class="btn btn-primary mt-3" @click="resetFilters">Сбросить фильтры</button>
          </div>
          
          <div v-else class="playlists-grid">
            <!-- Временные карточки плейлистов для примера -->
            <div class="playlist-card" v-for="(playlist, index) in playlists" :key="index">
              <div class="playlist-image">
                <img src="https://via.placeholder.com/280x180" alt="Плейлист">
              </div>
              <div class="playlist-content">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <div class="playlist-meta">
                  <span class="workout-type">{{ playlist.workoutType }}</span>
                  <span class="intensity">{{ playlist.intensity }}</span>
                </div>
                <div class="playlist-details">
                  <div class="detail">
                    <span class="label">BPM:</span>
                    <span class="value">{{ playlist.bpm }}</span>
                  </div>
                  <div class="detail">
                    <span class="label">Треков:</span>
                    <span class="value">{{ playlist.tracksCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  
  export default {
    name: 'PlaylistsPage',
    
    setup() {
      // Проверка на мобильное устройство
      const isMobile = ref(window.innerWidth < 768)
      const isMobileFiltersOpen = ref(false)
      
      // Состояние загрузки
      const loading = ref(false)
      
      // Фильтры
      const selectedGenres = ref([])
      const selectedWorkoutTypes = ref([])
      const selectedIntensities = ref([])
      
      // Данные для фильтров
      const genres = ref([
        { id: 1, name: 'Электронная' },
        { id: 2, name: 'Рок' },
        { id: 3, name: 'Хип-хоп' },
        { id: 4, name: 'Поп' },
        { id: 5, name: 'EDM' }
      ])
      
      const workoutTypes = ref([
        { value: 'cardio', label: 'Кардио' },
        { value: 'strength', label: 'Силовая' },
        { value: 'hiit', label: 'HIIT' },
        { value: 'yoga', label: 'Йога' },
        { value: 'recovery', label: 'Восстановление' }
      ])
      
      const intensityLevels = ref([
        { value: 'low', label: 'Низкая' },
        { value: 'medium', label: 'Средняя' },
        { value: 'high', label: 'Высокая' }
      ])
      
      // Пример плейлистов
      const playlists = ref([
        {
          name: 'Интенсивная кардио-тренировка',
          workoutType: 'Кардио',
          intensity: 'Высокая',
          bpm: 145,
          tracksCount: 12
        },
        {
          name: 'Силовая тренировка',
          workoutType: 'Силовая',
          intensity: 'Высокая',
          bpm: 120,
          tracksCount: 15
        },
        {
          name: 'Утренняя растяжка',
          workoutType: 'Йога',
          intensity: 'Низкая',
          bpm: 90,
          tracksCount: 8
        },
        {
          name: 'HIIT тренировка',
          workoutType: 'HIIT',
          intensity: 'Высокая',
          bpm: 160,
          tracksCount: 10
        }
      ])
      
      // Сброс фильтров
      const resetFilters = () => {
        selectedGenres.value = []
        selectedWorkoutTypes.value = []
        selectedIntensities.value = []
      }
      
      // Обработчик изменения размера окна
      const handleResize = () => {
        isMobile.value = window.innerWidth < 768
      }
      
      // Хуки жизненного цикла
      onMounted(() => {
        // Слушатель изменения размера окна
        window.addEventListener('resize', handleResize)
      })
      
      return {
        isMobile,
        isMobileFiltersOpen,
        loading,
        genres,
        workoutTypes,
        intensityLevels,
        selectedGenres,
        selectedWorkoutTypes,
        selectedIntensities,
        playlists,
        resetFilters
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .playlists-page {
    padding: var(--spacing-lg) 0;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    
    .page-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  .mobile-actions {
    display: flex;
    gap: var(--spacing-md);
    
    .filter-toggle {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }
  }
  
  .main-content {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--spacing-lg);
    
    @media (max-width: 767px) {
      grid-template-columns: 1fr;
    }
  }
  
  .sidebar {
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
  }
  
  .filter-section {
    margin-bottom: var(--spacing-lg);
    
    &:last-of-type {
      margin-bottom: 0;
    }
    
    .filter-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-md);
      position: relative;
      padding-bottom: var(--spacing-xs);
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 2px;
        background: var(--gradient-primary);
        border-radius: var(--border-radius-sm);
      }
    }
    
    .filter-options {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .filter-option {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 18px;
        height: 18px;
        background-color: var(--bg-tertiary);
        border-radius: 3px;
        outline: none;
        margin-right: var(--spacing-sm);
        position: relative;
        cursor: pointer;
        
        &:checked {
          background-color: var(--accent-primary);
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 1px;
          }
        }
        
        &:hover:not(:checked) {
          background-color: var(--bg-elevated);
        }
      }
      
      .option-label {
        color: var(--text-secondary);
        transition: color var(--transition-fast);
      }
      
      &:hover .option-label {
        color: var(--text-primary);
      }
    }
  }
  
  .playlists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    
    @media (max-width: 576px) {
      grid-template-columns: 1fr;
    }
  }
  
  .playlist-card {
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
    
    .playlist-image {
      height: 180px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .playlist-content {
      padding: var(--spacing-md);
    }
    
    .playlist-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-sm);
      line-height: var(--line-height-tight);
      height: 2.4em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .playlist-meta {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);
      
      span {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-xs);
        border-radius: var(--border-radius-sm);
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
      }
    }
    
    .playlist-details {
      display: flex;
      justify-content: space-between;
      
      .detail {
        .label {
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
        
        .value {
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          margin-left: var(--spacing-xs);
        }
      }
    }
  }
  
  .loading-container,
  .empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
    
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
      margin-bottom: var(--spacing-md);
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>