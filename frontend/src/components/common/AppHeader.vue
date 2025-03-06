<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Логотип -->
        <router-link to="/" class="logo">
          <span class="logo-text">FitBeast</span>
          <span class="logo-icon">💪</span>
        </router-link>
        
        <!-- Навигационное меню (десктоп) -->
        <nav class="desktop-nav" v-if="!isMobile">
          <ul class="nav-links">
            <li v-for="item in menuItems" :key="item.path">
              <router-link :to="item.path" :class="{'active': isActiveRoute(item.path)}">
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </nav>
        
        <!-- Правая часть шапки -->
        <div class="header-actions">
          <!-- Поиск -->
          <button class="btn-icon search-toggle" @click="toggleSearch" aria-label="Поиск">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <!-- Переключатель темы -->
          <button class="btn-icon theme-toggle" @click="toggleTheme" aria-label="Сменить тему">
            <svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
          
          <!-- Кнопка профиля или входа -->
          <div class="auth-buttons">
            <template v-if="isLoggedIn">
              <router-link to="/profile" class="profile-button">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.username" class="avatar">
                <div v-else class="avatar-placeholder">{{ userInitials }}</div>
              </router-link>
            </template>
            <template v-else>
              <router-link to="/login" class="btn btn-outline btn-sm">Войти</router-link>
            </template>
          </div>
          
          <!-- Меню-бургер для мобильных -->
          <button v-if="isMobile" class="btn-icon menu-toggle" @click="toggleMobileMenu" aria-label="Меню">
            <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Поисковый оверлей -->
    <div class="search-overlay" :class="{ 'active': isSearchOpen }">
      <div class="container">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            v-model="searchQuery" 
            placeholder="Поиск по продуктам..."
            @keyup.enter="submitSearch"
            ref="searchInput"
          >
          <button class="search-button" @click="submitSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button class="search-close" @click="closeSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Мобильное меню -->
    <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
      <div class="mobile-menu-container">
        <nav class="mobile-nav">
          <ul class="mobile-nav-links">
            <li v-for="item in menuItems" :key="item.path">
              <router-link 
                :to="item.path" 
                :class="{'active': isActiveRoute(item.path)}"
                @click="closeMobileMenu"
              >
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </nav>
        <div class="mobile-auth" v-if="!isLoggedIn">
          <router-link to="/login" class="btn btn-primary btn-block" @click="closeMobileMenu">Войти</router-link>
          <router-link to="/register" class="btn btn-outline btn-block mt-2" @click="closeMobileMenu">Регистрация</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AppHeader',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // Ссылки на элементы DOM
    const searchInput = ref(null)
    
    // Состояние компонента
    const isMobile = ref(window.innerWidth < 768)
    const isMobileMenuOpen = ref(false)
    const isSearchOpen = ref(false)
    const searchQuery = ref('')
    
    // Данные из хранилища
    const isDarkTheme = computed(() => store.state.app.darkMode)
    const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
    const user = computed(() => store.state.auth.user || {})
    
    // Вычисляемые свойства
    const userInitials = computed(() => {
      if (!user.value.username) return '?'
      return user.value.username.substring(0, 2).toUpperCase()
    })
    
    // Элементы меню
    const menuItems = [
      { name: 'Главная', path: '/' },
      { name: 'Продукты', path: '/products' },
      { name: 'Плейлисты', path: '/playlists' }
    ]
    
    // Проверка активного маршрута
    const isActiveRoute = (path) => {
      if (path === '/') {
        return route.path === '/'
      }
      return route.path.startsWith(path)
    }
    
    // Методы
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
      
      // Блокируем прокрутку при открытом меню
      if (isMobileMenuOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
      document.body.style.overflow = ''
    }
    
    const toggleSearch = () => {
      isSearchOpen.value = !isSearchOpen.value
      
      if (isSearchOpen.value) {
        document.body.style.overflow = 'hidden'
        // Фокусируемся на поле ввода после открытия
        nextTick(() => {
          searchInput.value.focus()
        })
      } else {
        document.body.style.overflow = ''
        searchQuery.value = ''
      }
    }
    
    const closeSearch = () => {
      isSearchOpen.value = false
      document.body.style.overflow = ''
      searchQuery.value = ''
    }
    
    const submitSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/products',
          query: { search: searchQuery.value.trim() }
        })
        closeSearch()
      }
    }
    
    const toggleTheme = () => {
      store.dispatch('app/toggleDarkMode')
    }
    
    // Обработчики ресайза окна
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
      
      // Закрываем мобильное меню при ресайзе на десктоп
      if (!isMobile.value && isMobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
    
    // Обработчик клика вне элементов
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen.value && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-toggle')) {
        closeMobileMenu()
      }
    }
    
    // Хуки жизненного цикла
    onMounted(() => {
      window.addEventListener('resize', handleResize)
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSearch()
          closeMobileMenu()
        }
      })
    })
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      isDarkTheme,
      isLoggedIn,
      user,
      userInitials,
      isMobile,
      isMobileMenuOpen,
      isSearchOpen,
      searchQuery,
      searchInput,
      menuItems,
      isActiveRoute,
      toggleMobileMenu,
      closeMobileMenu,
      toggleSearch,
      closeSearch,
      submitSearch,
      toggleTheme
    }
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-sticky);
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.header-content {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Логотип */
.logo {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  
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

/* Навигация для десктопа */
.desktop-nav {
  margin-left: auto;
  margin-right: var(--spacing-lg);
  
  .nav-links {
    display: flex;
    list-style: none;
    
    li {
      margin: 0 var(--spacing-md);
      
      a {
        display: block;
        padding: var(--spacing-xs) 0;
        color: var(--text-secondary);
        font-weight: var(--font-weight-medium);
        position: relative;
        transition: color var(--transition-fast);
        
        &:hover {
          color: var(--text-primary);
        }
        
        &.active {
          color: var(--accent-primary);
          
          &::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--gradient-primary);
            border-radius: var(--border-radius-sm);
          }
        }
      }
    }
  }
}

/* Правая часть шапки */
.header-actions {
  display: flex;
  align-items: center;
  
  .btn-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--text-secondary);
    margin-left: var(--spacing-sm);
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
  
  .auth-buttons {
    margin-left: var(--spacing-md);
    
    .profile-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--gradient-primary);
      
      .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-sm);
      }
    }
  }
}

/* Поисковый оверлей */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(18, 18, 18, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-fixed);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-normal), visibility var(--transition-normal);
  
  &.active {
    opacity: 1;
    visibility: visible;
  }
  
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
  }
  
  .search-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    padding-right: 100px;
    font-size: var(--font-size-lg);
    border: none;
    border-bottom: 2px solid var(--accent-primary);
    background-color: transparent;
    color: var(--text-primary);
    outline: none;
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
  
  .search-button {
    position: absolute;
    right: 50px;
    background: none;
    border: none;
    color: var(--accent-primary);
    cursor: pointer;
  }
  
  .search-close {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--text-primary);
    }
  }
}

/* Мобильное меню */
.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background-color: var(--bg-secondary);
  z-index: var(--z-index-dropdown);
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
  
  &.active {
    transform: translateX(0);
  }
  
  .mobile-menu-container {
    padding: var(--spacing-lg);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .mobile-nav {
    flex: 1;
    
    &-links {
      list-style: none;
      
      li {
        margin-bottom: var(--spacing-lg);
        
        a {
          display: block;
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          padding: var(--spacing-sm) 0;
          transition: color var(--transition-fast);
          
          &:hover {
            color: var(--text-primary);
          }
          
          &.active {
            color: var(--accent-primary);
          }
        }
      }
    }
  }
  
  .mobile-auth {
    margin-top: auto;
    padding-top: var(--spacing-lg);
    
    .btn-block {
      display: block;
      width: 100%;
      text-align: center;
    }
  }
}

@media (max-width: 767px) {
  .header-content {
    height: 60px;
  }
  
  .logo .logo-text {
    font-size: var(--font-size-md);
  }
}
</style>