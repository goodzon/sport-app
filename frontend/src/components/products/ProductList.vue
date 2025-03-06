<template>
  <div class="product-list">
    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка продуктов...</p>
    </div>
    
    <!-- Сообщение, если продуктов нет -->
    <div v-else-if="products.length === 0" class="empty-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p v-if="searchQuery">По запросу <strong>"{{ searchQuery }}"</strong> ничего не найдено</p>
      <p v-else>Продукты не найдены</p>
      <button class="btn btn-primary mt-3" @click="resetFilters">Сбросить фильтры</button>
    </div>
    
    <!-- Список продуктов -->
    <div v-else class="products-grid">
      <product-card
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
    
    <!-- Пагинация -->
    <div v-if="!loading && products.length > 0 && totalPages > 1" class="pagination">
      <button 
        class="pagination-button" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button 
        v-for="page in paginationButtons" 
        :key="page.value"
        class="pagination-button" 
        :class="{ 'active': page.value === currentPage, 'dots': page.type === 'dots' }"
        :disabled="page.type === 'dots'"
        @click="changePage(page.value)"
      >
        {{ page.label }}
      </button>
      
      <button 
        class="pagination-button" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import ProductCard from '@/components/products/ProductCard.vue'

export default {
  name: 'ProductList',
  
  components: {
    ProductCard
  },
  
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    products: {
      type: Array,
      default: () => []
    },
    totalItems: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 12
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  
  emits: ['page-change', 'reset-filters'],
  
  setup(props, { emit }) {
    const store = useStore()
    
    // Вычисляем общее количество страниц
    const totalPages = computed(() => {
      return Math.ceil(props.totalItems / props.itemsPerPage)
    })
    
    // Формируем кнопки пагинации
    const paginationButtons = computed(() => {
      const buttons = []
      const maxVisiblePages = 5
      
      if (totalPages.value <= maxVisiblePages) {
        // Если страниц мало, показываем все
        for (let i = 1; i <= totalPages.value; i++) {
          buttons.push({ value: i, label: i, type: 'page' })
        }
      } else {
        // Всегда показываем первую страницу
        buttons.push({ value: 1, label: 1, type: 'page' })
        
        // Определяем диапазон видимых страниц
        let startPage = Math.max(2, props.currentPage - 1)
        let endPage = Math.min(totalPages.value - 1, props.currentPage + 1)
        
        // Добавляем многоточие после первой страницы, если нужно
        if (startPage > 2) {
          buttons.push({ value: null, label: '...', type: 'dots' })
        }
        
        // Добавляем промежуточные страницы
        for (let i = startPage; i <= endPage; i++) {
          buttons.push({ value: i, label: i, type: 'page' })
        }
        
        // Добавляем многоточие перед последней страницей, если нужно
        if (endPage < totalPages.value - 1) {
          buttons.push({ value: null, label: '...', type: 'dots' })
        }
        
        // Всегда показываем последнюю страницу
        buttons.push({ value: totalPages.value, label: totalPages.value, type: 'page' })
      }
      
      return buttons
    })
    
    // Метод для смены страницы
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        emit('page-change', page)
      }
    }
    
    // Метод для сброса фильтров
    const resetFilters = () => {
      emit('reset-filters')
    }
    
    // Следим за изменением общего количества продуктов
    watch(() => props.totalItems, (newVal, oldVal) => {
      // Если общее количество продуктов изменилось и текущая страница больше общего числа страниц,
      // переходим на первую страницу
      if (newVal !== oldVal && props.currentPage > Math.ceil(newVal / props.itemsPerPage) && props.currentPage > 1) {
        changePage(1)
      }
    })
    
    return {
      totalPages,
      paginationButtons,
      changePage,
      resetFilters
    }
  }
}
</script>

<style lang="scss" scoped>
.product-list {
  width: 100%;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
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

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  
  svg {
    margin-bottom: var(--spacing-md);
    color: var(--text-tertiary);
  }
  
  p {
    color: var(--text-secondary);
    max-width: 400px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  gap: var(--spacing-xs);
  
  .pagination-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 var(--spacing-sm);
    border-radius: var(--border-radius-md);
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
    
    &:hover:not(:disabled) {
      background-color: var(--bg-elevated);
      color: var(--text-primary);
    }
    
    &.active {
      background: var(--gradient-primary);
      color: white;
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    &.dots {
      background-color: transparent;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>