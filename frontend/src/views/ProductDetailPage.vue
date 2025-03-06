<template>
    <div v-if="product" class="product-detail-page container">
      <div class="product-header">
        <div class="product-image">
          <img 
            v-if="product.image_url" 
            :src="product.image_url" 
            :alt="product.name"
          >
          <div v-else class="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>
        
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <div class="product-category">
            <span>{{ product.category_name }}</span>
          </div>
          
          <div class="nutrition-summary">
            <div class="nutrition-item">
              <span class="label">Калории</span>
              <span class="value">{{ formatCalories(product.calories) }}</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Белки</span>
              <span class="value">{{ formatGrams(product.proteins) }}</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Жиры</span>
              <span class="value">{{ formatGrams(product.fats) }}</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Углеводы</span>
              <span class="value">{{ formatGrams(product.carbs) }}</span>
            </div>
          </div>
          
          <div class="product-actions">
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
      
      <div class="product-description">
        <h2>Описание</h2>
        <p>{{ product.description || 'Описание отсутствует' }}</p>
      </div>
      
      <div class="nutrition-details">
        <h2>Подробная информация о пищевой ценности</h2>
        <div class="nutrition-grid">
          <div class="nutrition-detail">
            <div class="nutrition-label">Белки</div>
            <div class="nutrition-value">
              {{ formatGrams(product.proteins) }}
              <div class="nutrition-bar">
                <div 
                  class="bar protein-bar" 
                  :style="{ width: calculateNutrientPercentage(product.proteins, 30) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="nutrition-detail">
            <div class="nutrition-label">Жиры</div>
            <div class="nutrition-value">
              {{ formatGrams(product.fats) }}
              <div class="nutrition-bar">
                <div 
                  class="bar fat-bar" 
                  :style="{ width: calculateNutrientPercentage(product.fats, 30) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="nutrition-detail">
            <div class="nutrition-label">Углеводы</div>
            <div class="nutrition-value">
              {{ formatGrams(product.carbs) }}
              <div class="nutrition-bar">
                <div 
                  class="bar carb-bar" 
                  :style="{ width: calculateNutrientPercentage(product.carbs, 60) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка продукта...</p>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute } from 'vue-router'
  import { formatCalories, formatGrams } from '@/utils/formatters'
  
  export default {
    name: 'ProductDetailPage',
    
    props: {
      id: {
        type: [String, Number],
        required: true
      }
    },
    
    setup(props) {
      const store = useStore()
      const route = useRoute()
      
      // Получаем ID продукта из маршрута или пропсов
      const productId = ref(props.id || route.params.id)
      
      // Получаем продукт из состояния Vuex
      const product = computed(() => store.state.products.currentProduct)
      
      // Статус авторизации
      const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
      
      // Статус избранного
      const isFavorite = computed(() => 
        store.getters['products/isProductFavorite'](productId.value)
      )
      
      // Загрузка продукта при монтировании компонента
      onMounted(async () => {
        try {
          await store.dispatch('products/fetchProductById', productId.value)
        } catch (error) {
          // Обработка ошибки через глобальный обработчик в store
          store.dispatch('app/showNotification', {
            type: 'error',
            message: 'Не удалось загрузить информацию о продукте'
          })
        }
      })
      
      // Добавление/удаление из избранного
      const toggleFavorite = async () => {
        try {
          if (isFavorite.value) {
            await store.dispatch('products/removeFromFavorites', productId.value)
          } else {
            await store.dispatch('products/addToFavorites', productId.value)
          }
        } catch (error) {
          // Обработка ошибки через глобальный обработчик в store
        }
      }
      
      // Расчет процента для визуализации питательных веществ
      const calculateNutrientPercentage = (value, max) => {
        if (value === null || value === undefined) return 0
        return Math.min(Math.round((value / max) * 100), 100)
      }
      
      return {
        product,
        isLoggedIn,
        isFavorite,
        formatCalories,
        formatGrams,
        toggleFavorite,
        calculateNutrientPercentage
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .product-detail-page {
    padding: var(--spacing-xl) 0;
  }
  
  .product-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .product-image {
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
  
  .product-info {
    display: flex;
    flex-direction: column;
    
    h1 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
    }
    
    .product-category {
      margin-bottom: var(--spacing-md);
      
      span {
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-sm);
      }
    }
  }
  
  .nutrition-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    
    @media (max-width: 576px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .nutrition-item {
      background-color: var(--bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      text-align: center;
      
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
  
  .product-actions {
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
  
  .product-description {
    margin-bottom: var(--spacing-xl);
    
    h2 {
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
    }
    
    p {
      color: var(--text-secondary);
      line-height: var(--line-height-loose);
    }
  }
  
  .nutrition-details {
    h2 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }
    
    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .nutrition-detail {
      background-color: var(--bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      
      .nutrition-label {
        margin-bottom: var(--spacing-md);
        color: var(--text-secondary);
        font-weight: var(--font-weight-medium);
      }
      
      .nutrition-value {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--text-primary);
        font-weight: var(--font-weight-bold);
      }
      
      .nutrition-bar {
        width: 150px;
        height: 10px;
        background-color: var(--bg-tertiary);
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        
        .bar {
          height: 100%;
          border-radius: var(--border-radius-sm);
          
          &.protein-bar {
            background-color: #FF6B6B;
          }
          
          &.fat-bar {
            background-color: #FFD166;
          }
          
          &.carb-bar {
            background-color: #4D96FF;
          }
        }
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