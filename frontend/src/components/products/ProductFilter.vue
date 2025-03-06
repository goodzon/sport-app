<template>
  <div class="product-filter">
    <!-- Заголовок фильтров (на мобильных устройствах) -->
    <div class="filter-header" v-if="isMobile">
      <h3>Фильтры</h3>
      <button class="btn-icon close-filter" @click="toggleMobileFilters" aria-label="Закрыть фильтры">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- Категории продуктов -->
    <div class="filter-section">
      <h4 class="filter-title">Категории</h4>
      <div class="filter-options">
        <label class="filter-option">
          <input 
            type="radio" 
            name="category" 
            value="" 
            v-model="selectedCategory"
            @change="applyFilters"
          >
          <span class="option-label">Все категории</span>
        </label>
        
        <label 
          v-for="category in categories" 
          :key="category.slug" 
          class="filter-option"
        >
          <input 
            type="radio" 
            name="category" 
            :value="category.slug" 
            v-model="selectedCategory"
            @change="applyFilters"
          >
          <span class="option-label">{{ category.name }}</span>
        </label>
      </div>
    </div>
    
    <!-- Фильтр по пищевой ценности -->
    <div class="filter-section">
      <h4 class="filter-title">Пищевая ценность</h4>
      
      <div class="filter-options">
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="nutritionalFilters.highProtein"
            @change="applyFilters"
          >
          <span class="option-label">Высокое содержание белка</span>
        </label>
        
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="nutritionalFilters.lowFat"
            @change="applyFilters"
          >
          <span class="option-label">Низкое содержание жира</span>
        </label>
        
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="nutritionalFilters.lowCarb"
            @change="applyFilters"
          >
          <span class="option-label">Низкое содержание углеводов</span>
        </label>
        
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="nutritionalFilters.lowCalorie"
            @change="applyFilters"
          >
          <span class="option-label">Низкокалорийные</span>
        </label>
      </div>
    </div>
    
    <!-- Диапазоны значений -->
    <div class="filter-section">
      <h4 class="filter-title">Диапазоны</h4>
      
      <!-- Калории -->
      <div class="range-filter">
        <label class="range-label">Калории (ккал)</label>
        <div class="range-values">
          <input 
            type="number" 
            v-model.number="ranges.calories.min" 
            placeholder="От" 
            min="0" 
            max="1000"
            @change="applyFilters"
          >
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model.number="ranges.calories.max" 
            placeholder="До" 
            min="0" 
            max="1000"
            @change="applyFilters"
          >
        </div>
      </div>
      
      <!-- Белки -->
      <div class="range-filter">
        <label class="range-label">Белки (г)</label>
        <div class="range-values">
          <input 
            type="number" 
            v-model.number="ranges.proteins.min" 
            placeholder="От" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model.number="ranges.proteins.max" 
            placeholder="До" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
        </div>
      </div>
      
      <!-- Жиры -->
      <div class="range-filter">
        <label class="range-label">Жиры (г)</label>
        <div class="range-values">
          <input 
            type="number" 
            v-model.number="ranges.fats.min" 
            placeholder="От" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model.number="ranges.fats.max" 
            placeholder="До" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
        </div>
      </div>
      
      <!-- Углеводы -->
      <div class="range-filter">
        <label class="range-label">Углеводы (г)</label>
        <div class="range-values">
          <input 
            type="number" 
            v-model.number="ranges.carbs.min" 
            placeholder="От" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model.number="ranges.carbs.max" 
            placeholder="До" 
            min="0" 
            max="100"
            @change="applyFilters"
          >
        </div>
      </div>
    </div>
    
    <!-- Кнопки -->
    <div class="filter-actions">
      <button class="btn btn-outline btn-block" @click="resetFilters">
        Сбросить
      </button>
      <button v-if="isMobile" class="btn btn-primary btn-block mt-2" @click="applyFilters">
        Применить
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ProductFilter',
  
  props: {
    isMobileFiltersOpen: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:isMobileFiltersOpen', 'filter'],
  
  setup(props, { emit }) {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    // Проверка на мобильное устройство
    const isMobile = ref(window.innerWidth < 768)
    
    // Данные для фильтрации
    const selectedCategory = ref('')
    const nutritionalFilters = reactive({
      highProtein: false,
      lowFat: false,
      lowCarb: false,
      lowCalorie: false
    })
    const ranges = reactive({
      calories: { min: null, max: null },
      proteins: { min: null, max: null },
      fats: { min: null, max: null },
      carbs: { min: null, max: null }
    })
    
    // Получаем категории из хранилища
    const categories = computed(() => store.state.products.categories)
    
    // Инициализация фильтров из URL-параметров
    const initFiltersFromQuery = () => {
      const { query } = route
      
      // Категория
      if (query.category) {
        selectedCategory.value = query.category
      }
      
      // Флаги пищевой ценности
      nutritionalFilters.highProtein = query.highProtein === 'true'
      nutritionalFilters.lowFat = query.lowFat === 'true'
      nutritionalFilters.lowCarb = query.lowCarb === 'true'
      nutritionalFilters.lowCalorie = query.lowCalorie === 'true'
      
      // Диапазоны
      if (query.caloriesMin) ranges.calories.min = Number(query.caloriesMin)
      if (query.caloriesMax) ranges.calories.max = Number(query.caloriesMax)
      if (query.proteinsMin) ranges.proteins.min = Number(query.proteinsMin)
      if (query.proteinsMax) ranges.proteins.max = Number(query.proteinsMax)
      if (query.fatsMin) ranges.fats.min = Number(query.fatsMin)
      if (query.fatsMax) ranges.fats.max = Number(query.fatsMax)
      if (query.carbsMin) ranges.carbs.min = Number(query.carbsMin)
      if (query.carbsMax) ranges.carbs.max = Number(query.carbsMax)
    }
    
    // Сборка фильтров в объект
    const getFiltersObject = () => {
      const filters = {}
      
      // Категория
      if (selectedCategory.value) {
        filters.category = selectedCategory.value
      }
      
      // Флаги пищевой ценности
      if (nutritionalFilters.highProtein) filters.highProtein = true
      if (nutritionalFilters.lowFat) filters.lowFat = true
      if (nutritionalFilters.lowCarb) filters.lowCarb = true
      if (nutritionalFilters.lowCalorie) filters.lowCalorie = true
      
      // Диапазоны
      if (ranges.calories.min !== null) filters.caloriesMin = ranges.calories.min
      if (ranges.calories.max !== null) filters.caloriesMax = ranges.calories.max
      if (ranges.proteins.min !== null) filters.proteinsMin = ranges.proteins.min
      if (ranges.proteins.max !== null) filters.proteinsMax = ranges.proteins.max
      if (ranges.fats.min !== null) filters.fatsMin = ranges.fats.min
      if (ranges.fats.max !== null) filters.fatsMax = ranges.fats.max
      if (ranges.carbs.min !== null) filters.carbsMin = ranges.carbs.min
      if (ranges.carbs.max !== null) filters.carbsMax = ranges.carbs.max
      
      return filters
    }
    
    // Применение фильтров
    const applyFilters = () => {
      const filters = getFiltersObject()
      
      // Обновляем URL параметры
      router.push({
        path: route.path,
        query: {
          ...route.query,
          ...filters,
          page: 1 // Сбрасываем страницу на первую при изменении фильтров
        }
      })
      
      // Закрываем мобильные фильтры после применения
      if (isMobile.value) {
        emit('update:isMobileFiltersOpen', false)
      }
      
      // Отправляем событие фильтрации
      emit('filter', filters)
    }
    
    // Сброс фильтров
    const resetFilters = () => {
      selectedCategory.value = ''
      
      nutritionalFilters.highProtein = false
      nutritionalFilters.lowFat = false
      nutritionalFilters.lowCarb = false
      nutritionalFilters.lowCalorie = false
      
      ranges.calories.min = null
      ranges.calories.max = null
      ranges.proteins.min = null
      ranges.proteins.max = null
      ranges.fats.min = null
      ranges.fats.max = null
      ranges.carbs.min = null
      ranges.carbs.max = null
      
      // Сохраняем только параметр поиска, если он есть
      const query = route.query.search ? { search: route.query.search } : {}
      
      router.push({
        path: route.path,
        query
      })
      
      // Отправляем событие фильтрации
      emit('filter', {})
    }
    
    // Переключение мобильных фильтров
    const toggleMobileFilters = () => {
      emit('update:isMobileFiltersOpen', !props.isMobileFiltersOpen)
    }
    
    // Обработчик изменения размера окна
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
    }
    
    // Хуки жизненного цикла
    onMounted(() => {
      // Инициализация фильтров из URL при загрузке
      initFiltersFromQuery()
      
      // Слушатель изменения размера окна
      window.addEventListener('resize', handleResize)
    })
    
    // Наблюдаем за изменением маршрута
    watch(
      () => route.query,
      (newQuery) => {
        // Проверяем, изменились ли фильтры извне (например, при нажатии на категорию в другом месте)
        if (newQuery.category !== selectedCategory.value) {
          initFiltersFromQuery()
        }
      },
      { deep: true }
    )
    
    return {
      isMobile,
      categories,
      selectedCategory,
      nutritionalFilters,
      ranges,
      applyFilters,
      resetFilters,
      toggleMobileFilters
    }
  }
}
</script>

<style lang="scss" scoped>
.product-filter {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }
  
  .close-filter {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
}

.filter-section {
  margin-bottom: var(--spacing-lg);
  
  &:last-of-type {
    margin-bottom: var(--spacing-xl);
  }
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
  
  input[type="radio"],
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
  
  input[type="radio"] {
    border-radius: 50%;
    
    &:checked::after {
      border-radius: 50%;
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

.range-filter {
  margin-bottom: var(--spacing-md);
  
  .range-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
  
  .range-values {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    
    input {
      flex: 1;
      padding: var(--spacing-sm);
      background-color: var(--bg-tertiary);
      border: none;
      border-radius: var(--border-radius-sm);
      color: var(--text-primary);
      
      &:focus {
        outline: 2px solid var(--accent-primary);
      }
      
      // Убираем стрелки у input[type="number"]
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      
      &[type="number"] {
        -moz-appearance: textfield;
      }
    }
    
    .range-separator {
      color: var(--text-tertiary);
    }
  }
}

.filter-actions {
  margin-top: auto;
  
  .btn-block {
    width: 100%;
    text-align: center;
  }
}

// Медиа-запросы
@media (max-width: $breakpoint-md) {
  .product-filter {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-index-modal);
    border-radius: 0;
    overflow-y: auto;
  }
}
</style>