<template>
  <div class="product-card" :class="{ 'is-favorite': isFavorite }">
    <!-- Бейдж категории -->
    <div class="product-category">
      <span class="category-badge">{{ categoryName }}</span>
    </div>
    
    <!-- Кнопка добавления в избранное -->
    <button 
      v-if="isLoggedIn" 
      class="favorite-button" 
      @click.prevent="toggleFavorite"
      :aria-label="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
    >
      <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
    
    <!-- Контент карточки -->
    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="card-link">
      <div class="product-image">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name">
        <div v-else class="image-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 7l5-5 5 5"></path>
            <path d="M12 2v8"></path>
            <circle cx="12" cy="14" r="3"></circle>
            <path d="M12 17v5"></path>
          </svg>
        </div>
      </div>
      
      <div class="product-content">
        <h3 class="product-name">{{ product.name }}</h3>
        
        <!-- Основная информация о пищевой ценности -->
        <div class="nutrition-summary">
          <div class="nutrition-item" v-if="product.calories !== null">
            <span class="label">Калории:</span>
            <span class="value">{{ product.calories }} ккал</span>
          </div>
          <div class="nutrition-item" v-if="product.proteins !== null">
            <span class="label">Белки:</span>
            <span class="value">{{ product.proteins }}г</span>
          </div>
          <div class="nutrition-item" v-if="product.fats !== null">
            <span class="label">Жиры:</span>
            <span class="value">{{ product.fats }}г</span>
          </div>
          <div class="nutrition-item" v-if="product.carbs !== null">
            <span class="label">Углеводы:</span>
            <span class="value">{{ product.carbs }}г</span>
          </div>
        </div>
        
        <!-- Прогресс-бары для наглядного представления -->
        <div class="nutrition-progress" v-if="showNutritionBars">
          <div class="progress-item" v-if="product.proteins !== null">
            <div class="progress-label">
              <span class="icon protein-icon">P</span>
              <span class="value">{{ product.proteins }}г</span>
            </div>
            <div class="progress-bar">
              <div class="progress protein-bar" :style="{ width: `${calculatePercentage(product.proteins, 30)}%` }"></div>
            </div>
          </div>
          
          <div class="progress-item" v-if="product.fats !== null">
            <div class="progress-label">
              <span class="icon fat-icon">F</span>
              <span class="value">{{ product.fats }}г</span>
            </div>
            <div class="progress-bar">
              <div class="progress fat-bar" :style="{ width: `${calculatePercentage(product.fats, 30)}%` }"></div>
            </div>
          </div>
          
          <div class="progress-item" v-if="product.carbs !== null">
            <div class="progress-label">
              <span class="icon carb-icon">C</span>
              <span class="value">{{ product.carbs }}г</span>
            </div>
            <div class="progress-bar">
              <div class="progress carb-bar" :style="{ width: `${calculatePercentage(product.carbs, 60)}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ProductCard',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    showNutritionBars: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props) {
    const store = useStore()
    
    // Получаем статус авторизации
    const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
    
    // Получаем название категории
    const categoryName = computed(() => {
      if (props.product.category_name) {
        return props.product.category_name
      } else if (props.product.category) {
        return store.getters['products/getCategoryNameBySlug'](props.product.category)
      }
      return 'Продукт'
    })
    
    // Проверяем, находится ли продукт в избранном
    const isFavorite = computed(() => {
      return store.getters['products/isProductFavorite'](props.product.id)
    })
    
    // Метод для расчета процентного соотношения для прогресс-баров
    const calculatePercentage = (value, max) => {
      if (value === null || value === undefined) return 0
      return Math.min(Math.round((value / max) * 100), 100)
    }
    
    // Метод для добавления/удаления продукта из избранного
    const toggleFavorite = async () => {
      try {
        if (isFavorite.value) {
          await store.dispatch('products/removeFromFavorites', props.product.id)
        } else {
          await store.dispatch('products/addToFavorites', props.product.id)
        }
      } catch (error) {
        console.error('Ошибка при обновлении статуса избранного:', error)
      }
    }
    
    return {
      isLoggedIn,
      categoryName,
      isFavorite,
      calculatePercentage,
      toggleFavorite
    }
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    
    .product-image img {
      transform: scale(1.05);
    }
  }
  
  &.is-favorite {
    .favorite-button {
      color: var(--accent-primary);
    }
  }
}

.card-link {
  display: block;
  color: var(--text-primary);
  
  &:hover {
    color: var(--text-primary);
  }
}

.product-category {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  z-index: 1;
  
  .category-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(29, 29, 29, 0.8);
    color: var(--text-primary);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    backdrop-filter: blur(4px);
  }
}

.favorite-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(29, 29, 29, 0.8);
  color: var(--text-secondary);
  backdrop-filter: blur(4px);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: rgba(29, 29, 29, 0.9);
    color: var(--accent-primary);
    transform: scale(1.1);
  }
}

.product-image {
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
    color: var(--text-tertiary);
  }
}

.product-content {
  padding: var(--spacing-md);
}

.product-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
  height: 2.4em; // Ограничиваем высоту названия (2 строки)
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.nutrition-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  
  .nutrition-item {
    font-size: var(--font-size-sm);
    
    .label {
      color: var(--text-tertiary);
      margin-right: var(--spacing-xs);
    }
    
    .value {
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
    }
  }
}

.nutrition-progress {
  .progress-item {
    margin-bottom: var(--spacing-xs);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .progress-label {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-xs);
    
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      margin-right: var(--spacing-xs);
    }
    
    .protein-icon {
      background-color: #FF6B6B;
      color: white;
    }
    
    .fat-icon {
      background-color: #FFD166;
      color: black;
    }
    
    .carb-icon {
      background-color: #4D96FF;
      color: white;
    }
    
    .value {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
  }
  
  .progress-bar {
    height: 4px;
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-sm);
    overflow: hidden;
  }
  
  .progress {
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
</style>