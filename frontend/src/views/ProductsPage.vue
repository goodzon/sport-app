<template>
  <div class="products-page">
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        
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
          
          <div class="sort-dropdown">
            <label for="sortMobile">Сортировка:</label>
            <select id="sortMobile" v-model="sortOption" @change="updateSortOption">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Панель поиска и сортировки -->
      <div class="search-sort-panel" v-if="!isMobile">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск продуктов..." 
            @keyup.enter="performSearch"
          >
          <button class="search-button" @click="performSearch" aria-label="Поиск">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div class="sort-box">
          <label for="sortDesktop">Сортировка:</label>
          <select id="sortDesktop" v-model="sortOption" @change="updateSortOption">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Мобильная панель поиска -->
      <div class="mobile-search" v-if="isMobile">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск продуктов..." 
            @keyup.enter="performSearch"
          >
          <button class="search-button" @click="performSearch" aria-label="Поиск">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Информация о фильтрах и количестве продуктов -->
      <div class="filter-info" v-if="activeFiltersCount > 0 || searchQuery">
        <div class="filter-tags">
          <div class="filter-count">
            <span v-if="searchQuery" class="filter-tag search-tag">
              Поиск: {{ searchQuery }}
              <button class="tag-remove" @click="clearSearch" aria-label="Очистить поиск">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
            
            <span v-if="categoryName" class="filter-tag">
              Категория: {{ categoryName }}
              <button class="tag-remove" @click="clearCategoryFilter" aria-label="Очистить категорию">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
            
            <!-- Другие фильтры, можно добавить по аналогии -->
          </div>
          
          <button v-if="activeFiltersCount > 0" class="clear-filters" @click="clearAllFilters">
            Сбросить все
          </button>
        </div>
        
        <div class="results-count">
          Найдено продуктов: <strong>{{ totalProducts }}</strong>
        </div>
      </div>
      
      <!-- Основной контент -->
      <div class="main-content">
        <!-- Боковая панель с фильтрами (десктоп) -->
        <aside class="sidebar" v-if="!isMobile">
          <product-filter @filter="handleFilterChange" />
        </aside>
        
        <!-- Мобильные фильтры (оверлей) -->
        <div class="mobile-filters-overlay" v-if="isMobile && isMobileFiltersOpen">
          <product-filter 
            v-model:isMobileFiltersOpen="isMobileFiltersOpen"
            @filter="handleFilterChange" 
          />
        </div>
        
        <!-- Список продуктов -->
        <main class="products-container">
          <product-list 
            :loading="loading" 
            :products="products" 
            :total-items="totalProducts" 
            :current-page="currentPage" 
            :items-per-page="itemsPerPage"
            :search-query="searchQuery"
            @page-change="handlePageChange"
            @reset-filters="clearAllFilters"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

import ProductFilter from '@/components/products/ProductFilter.vue'
import ProductList from '@/components/products/ProductList.vue'

export default {
  name: 'ProductsPage',
  
  components: {
    ProductFilter,
    ProductList
  },
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    // Проверка на мобильное устройство
    const isMobile = ref(window.innerWidth < 768)
    const isMobileFiltersOpen = ref(false)
    
    // Состояние загрузки
    const loading = ref(false)
    
    // Параметры пагинации
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    
    // Параметры поиска и сортировки
    const searchQuery = ref('')
    const sortOption = ref('name_asc')
    
    // Опции сортировки
    const sortOptions = [
      { value: 'name_asc', label: 'По названию (А-Я)' },
      { value: 'name_desc', label: 'По названию (Я-А)' },
      { value: 'calories_asc', label: 'По калориям (↑)' },
      { value: 'calories_desc', label: 'По калориям (↓)' },
      { value: 'proteins_desc', label: 'По белкам (↓)' },
      { value: 'fats_desc', label: 'По жирам (↓)' },
      { value: 'carbs_desc', label: 'По углеводам (↓)' }
    ]
    
    // Получаем продукты и их общее количество из хранилища
    const products = computed(() => store.state.products.items)
    const totalProducts = computed(() => store.state.products.totalItems)
    
    // Получаем категории из хранилища
    const categories = computed(() => store.state.products.categories)
    
    // Название категории, если выбрана
    const categoryName = computed(() => {
      const categorySlug = route.query.category
      if (!categorySlug) return ''
      
      const category = categories.value.find(c => c.slug === categorySlug)
      return category ? category.name : ''
    })
    
    // Заголовок страницы в зависимости от фильтров
    const pageTitle = computed(() => {
      if (route.query.search) {
        return `Поиск: ${route.query.search}`
      }
      
      if (categoryName.value) {
        return categoryName.value
      }
      
      return 'Все продукты'
    })
    
    // Количество активных фильтров
    const activeFiltersCount = computed(() => {
      let count = 0
      
      if (route.query.category) count++
      if (route.query.highProtein === 'true') count++
      if (route.query.lowFat === 'true') count++
      if (route.query.lowCarb === 'true') count++
      if (route.query.lowCalorie === 'true') count++
      if (route.query.caloriesMin || route.query.caloriesMax) count++
      if (route.query.proteinsMin || route.query.proteinsMax) count++
      if (route.query.fatsMin || route.query.fatsMax) count++
      if (route.query.carbsMin || route.query.carbsMax) count++
      
      return count
    })
    
    // Инициализация параметров из URL
    const initFromQuery = () => {
      const { query } = route
      
      // Параметры пагинации
      currentPage.value = query.page ? parseInt(query.page) : 1
      
      // Параметры поиска
      searchQuery.value = query.search || ''
      
      // Параметры сортировки
      if (query.sort && query.order) {
        sortOption.value = `${query.sort}_${query.order}`
      }
    }
    
    // Загрузка данных
    const loadProducts = async () => {
      try {
        loading.value = true
        
        // Параметры запроса
        const { query } = route
        const params = {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: query.search || '',
          ...query
        }
        
        // Параметры сортировки
        if (sortOption.value) {
          const [sort, order] = sortOption.value.split('_')
          params.sort = sort
          params.order = order
        }
        
        // Запрос на получение продуктов
        await store.dispatch('products/fetchProducts', params)
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error)
        store.dispatch('app/showNotification', {
          type: 'error',
          message: 'Не удалось загрузить продукты. Попробуйте позже.'
        })
      } finally {
        loading.value = false
      }
    }
    
    // Загрузка категорий
    const loadCategories = async () => {
      try {
        await store.dispatch('products/fetchCategories')
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      }
    }
    
    // Обработка изменения фильтров
    const handleFilterChange = (filters) => {
      // Обновление URL уже происходит в компоненте фильтра
      // Здесь мы можем добавить дополнительную логику при необходимости
    }
    
    // Обработка изменения страницы
    const handlePageChange = (page) => {
      router.push({
        path: route.path,
        query: {
          ...route.query,
          page
        }
      })
    }
    
    // Выполнение поиска
    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: route.path,
          query: {
            ...route.query,
            search: searchQuery.value.trim(),
            page: 1 // Сбрасываем страницу на первую при поиске
          }
        })
      } else if (route.query.search) {
        // Если поисковый запрос пуст, но в URL он есть - удаляем его
        clearSearch()
      }
    }
    
    // Обновление опции сортировки
    const updateSortOption = () => {
      const [sort, order] = sortOption.value.split('_')
      
      router.push({
        path: route.path,
        query: {
          ...route.query,
          sort,
          order,
          page: 1 // Сбрасываем страницу на первую при изменении сортировки
        }
      })
    }
    
    // Очистка поиска
    const clearSearch = () => {
      searchQuery.value = ''
      
      const query = { ...route.query }
      delete query.search
      
      router.push({
        path: route.path,
        query
      })
    }
    
    // Очистка фильтра по категории
    const clearCategoryFilter = () => {
      const query = { ...route.query }
      delete query.category
      
      router.push({
        path: route.path,
        query
      })
    }
    
    // Очистка всех фильтров
    const clearAllFilters = () => {
      // Сохраняем только параметр поиска, если он есть
      const query = route.query.search ? { search: route.query.search } : {}
      
      router.push({
        path: route.path,
        query
      })
    }
    
    // Обработчик изменения размера окна
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
      
      // Закрываем мобильные фильтры при изменении размера окна на десктоп
      if (!isMobile.value) {
        isMobileFiltersOpen.value = false
      }
    }
    
    // Хуки жизненного цикла
    onMounted(() => {
      // Инициализация параметров из URL
      initFromQuery()
      
      // Загрузка данных
      loadCategories()
      loadProducts()
      
      // Слушатель изменения размера окна
      window.addEventListener('resize', handleResize)
    })
    
    // Наблюдаем за изменениями в URL
    watch(
      () => route.query,
      (newQuery) => {
        initFromQuery()
        loadProducts()
      },
      { deep: true }
    )
    
    return {
      isMobile,
      isMobileFiltersOpen,
      loading,
      products,
      totalProducts,
      currentPage,
      itemsPerPage,
      searchQuery,
      sortOption,
      sortOptions,
      categoryName,
      pageTitle,
      activeFiltersCount,
      handleFilterChange,
      handlePageChange,
      performSearch,
      updateSortOption,
      clearSearch,
      clearCategoryFilter,
      clearAllFilters
    }
  }
}
</script>

<style lang="scss" scoped>
.products-page {
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
  
  .sort-dropdown {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    
    label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    
    select {
      background-color: var(--bg-tertiary);
      border: none;
      border-radius: var(--border-radius-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      color: var(--text-primary);
      outline: none;
    }
  }
}

.search-sort-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  .search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
    
    input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-lg);
      padding-right: 40px;
      background-color: var(--bg-tertiary);
      border: none;
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      
      &:focus {
        outline: 2px solid var(--accent-primary);
      }
    }
    
    .search-button {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      
      &:hover {
        color: var(--accent-primary);
      }
    }
  }
  
  .sort-box {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    label {
      color: var(--text-secondary);
    }
    
    select {
      background-color: var(--bg-tertiary);
      border: none;
      border-radius: var(--border-radius-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-primary);
      outline: none;
    }
  }
}

.mobile-search {
  margin-bottom: var(--spacing-lg);
  
  .search-box {
    position: relative;
    
    input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-lg);
      padding-right: 40px;
      background-color: var(--bg-tertiary);
      border: none;
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      
      &:focus {
        outline: 2px solid var(--accent-primary);
      }
    }
    
    .search-button {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      
      &:hover {
        color: var(--accent-primary);
      }
    }
  }
}

.filter-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .filter-count {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .filter-tag {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    
    &.search-tag {
      background-color: var(--accent-primary);
      color: white;
      
      .tag-remove {
        color: white;
      }
    }
    
    .tag-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: var(--spacing-xs);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      
      &:hover {
        color: var(--text-primary);
      }
    }
  }
  
  .clear-filters {
    background: none;
    border: none;
    color: var(--accent-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .results-count {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-lg);
  
  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.mobile-filters-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-index-modal);
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
</style>