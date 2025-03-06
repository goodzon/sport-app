<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <!-- Логотип и описание -->
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            <span class="logo-text">FitBeast</span>
            <span class="logo-icon">💪</span>
          </router-link>
          <p class="footer-description">
            Отслеживай свое питание и тренируйся с лучшими плейлистами, созданными специально для твоих тренировок.
          </p>
        </div>
        
        <!-- Ссылки -->
        <div class="footer-links">
          <h3 class="footer-title">Навигация</h3>
          <ul>
            <li v-for="item in links" :key="item.path">
              <router-link :to="item.path">{{ item.name }}</router-link>
            </li>
          </ul>
        </div>
        
        <!-- Категории продуктов -->
        <div class="footer-categories">
          <h3 class="footer-title">Категории продуктов</h3>
          <ul>
            <li v-for="category in categories" :key="category.id">
              <router-link :to="`/products/category/${category.slug}`">
                {{ category.name }}
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- Контакты и соцсети -->
        <div class="footer-social">
          <h3 class="footer-title">Присоединяйтесь</h3>
          <div class="social-icons">
            <a href="#" class="social-icon" aria-label="Telegram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </a>
            <a href="#" class="social-icon" aria-label="ВКонтакте">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"></path>
                <path d="M16 2v4"></path>
                <path d="M8 2v4"></path>
                <path d="M3 10h18"></path>
              </svg>
            </a>
            <a href="#" class="social-icon" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" class="social-icon" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Копирайт -->
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} FitBeast. Все права защищены.</p>
        <div class="footer-bottom-links">
          <router-link to="/policy">Политика конфиденциальности</router-link>
          <router-link to="/terms">Условия использования</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AppFooter',
  
  setup() {
    const store = useStore()
    
    // Текущий год для копирайта
    const currentYear = new Date().getFullYear()
    
    // Основные ссылки
    const links = [
      { name: 'Главная', path: '/' },
      { name: 'Продукты', path: '/products' },
      { name: 'Плейлисты', path: '/playlists' },
      { name: 'Профиль', path: '/profile' }
    ]
    
    // Популярные категории продуктов
    // В реальном приложении эти данные будут загружаться из API
    const categories = computed(() => {
      return store.state.products.categories.slice(0, 5)
    })
    
    return {
      currentYear,
      links,
      categories
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: var(--bg-secondary);
  padding: var(--spacing-xl) 0;
  margin-top: auto;
  border-top: 1px solid var(--bg-tertiary);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.footer-brand {
  .footer-logo {
    display: flex;
    align-items: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--accent-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: var(--spacing-md);
    
    &:hover {
      color: var(--accent-primary);
    }
    
    .logo-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .logo-icon {
      margin-left: var(--spacing-xs);
      font-size: var(--font-size-xl);
    }
  }
  
  .footer-description {
    color: var(--text-secondary);
    line-height: var(--line-height-loose);
  }
}

.footer-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  position: relative;
  padding-bottom: var(--spacing-sm);
  display: inline-block;
  
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

.footer-links, .footer-categories, .footer-social {
  ul {
    list-style: none;
    
    li {
      margin-bottom: var(--spacing-sm);
      
      a {
        color: var(--text-secondary);
        transition: color var(--transition-fast);
        display: block;
        padding: var(--spacing-xs) 0;
        
        &:hover {
          color: var(--accent-primary);
        }
      }
    }
  }
}

.social-icons {
  display: flex;
  gap: var(--spacing-md);
  
  .social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius-circle);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--gradient-primary);
      color: white;
      transform: translateY(-3px);
    }
  }
}

.footer-bottom {
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--bg-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .footer-bottom-links {
    display: flex;
    gap: var(--spacing-md);
    
    a {
      color: var(--text-tertiary);
      
      &:hover {
        color: var(--accent-primary);
      }
    }
  }
}
</style>