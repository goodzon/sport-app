<template>
    <div class="profile-page container">
      <div class="profile-header">
        <div class="profile-avatar">
          <img 
            v-if="user.avatarUrl" 
            :src="user.avatarUrl" 
            :alt="user.username"
          >
          <div v-else class="avatar-placeholder">
            {{ userInitials }}
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ user.firstName || user.username }}</h1>
          <p>{{ user.email }}</p>
        </div>
      </div>
  
      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="{ 'active': currentTab === tab.id }"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <div class="profile-content">
        <div v-if="currentTab === 'profile'" class="profile-details">
          <h2>Личная информация</h2>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>Имя</label>
              <input 
                type="text" 
                v-model="editProfile.firstName" 
                placeholder="Ваше имя"
              >
            </div>
            <div class="form-group">
              <label>Фамилия</label>
              <input 
                type="text" 
                v-model="editProfile.lastName" 
                placeholder="Ваша фамилия"
              >
            </div>
            <div class="form-group">
              <label>Имя пользователя</label>
              <input 
                type="text" 
                v-model="editProfile.username" 
                placeholder="Имя пользователя"
              >
            </div>
            <button type="submit" class="btn btn-primary">
              Обновить профиль
            </button>
          </form>
        </div>
  
        <div v-else-if="currentTab === 'settings'" class="profile-settings">
          <h2>Настройки</h2>
          <div class="settings-group">
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.darkMode"
                @change="updateSettings"
              >
              <span>Темная тема</span>
            </label>
            
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.notificationsEnabled"
                @change="updateSettings"
              >
              <span>Уведомления</span>
            </label>
          </div>
        </div>
  
        <div v-else-if="currentTab === 'security'" class="profile-security">
          <h2>Безопасность</h2>
          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label>Текущий пароль</label>
              <input 
                type="password" 
                v-model="passwordData.currentPassword" 
                placeholder="Текущий пароль"
              >
            </div>
            <div class="form-group">
              <label>Новый пароль</label>
              <input 
                type="password" 
                v-model="passwordData.newPassword" 
                placeholder="Новый пароль"
              >
            </div>
            <div class="form-group">
              <label>Подтвердите новый пароль</label>
              <input 
                type="password" 
                v-model="passwordData.confirmPassword" 
                placeholder="Подтвердите пароль"
              >
            </div>
            <button type="submit" class="btn btn-primary">
              Изменить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, reactive, onMounted } from 'vue'
  import { useStore } from 'vuex'
  
  export default {
    name: 'ProfilePage',
    
    setup() {
      const store = useStore()
      
      // Вкладки профиля
      const tabs = [
        { id: 'profile', label: 'Профиль' },
        { id: 'settings', label: 'Настройки' },
        { id: 'security', label: 'Безопасность' }
      ]
      
      const currentTab = ref('profile')
      
      // Данные пользователя
      const user = computed(() => store.state.auth.user || {})
      
      // Вычисляем инициалы
      const userInitials = computed(() => {
        if (user.value.firstName && user.value.lastName) {
          return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
        }
        return user.value.username ? user.value.username.substring(0, 2).toUpperCase() : '?'
      })
      
      // Редактирование профиля
      const editProfile = reactive({
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        username: user.value.username || ''
      })
      
      // Настройки
      const settings = reactive({
        darkMode: user.value.settings?.darkMode || false,
        notificationsEnabled: user.value.settings?.notificationsEnabled || true
      })
      
      // Данные для смены пароля
      const passwordData = reactive({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Обновление профиля
      const updateProfile = async () => {
        try {
          await store.dispatch('auth/updateProfile', {
            firstName: editProfile.firstName,
            lastName: editProfile.lastName,
            username: editProfile.username
          })
        } catch (error) {
          // Обработка ошибок через уведомления в Vuex
        }
      }
      
      // Обновление настроек
      const updateSettings = async () => {
        try {
          await store.dispatch('auth/updateSettings', {
            darkMode: settings.darkMode,
            notificationsEnabled: settings.notificationsEnabled
          })
        } catch (error) {
          // Обработка ошибок через уведомления в Vuex
        }
      }
      
      // Обновление пароля
      const updatePassword = async () => {
        // Здесь можно добавить клиентскую валидацию
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          // Показать ошибку что пароли не совпадают
          return
        }
        
        try {
          await store.dispatch('auth/updatePassword', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
          
          // Очистить форму после успешной смены
          passwordData.currentPassword = ''
          passwordData.newPassword = ''
          passwordData.confirmPassword = ''
        } catch (error) {
          // Обработка ошибок через уведомления в Vuex
        }
      }
      
      return {
        tabs,
        currentTab,
        user,
        userInitials,
        editProfile,
        settings,
        passwordData,
        updateProfile,
        updateSettings,
        updatePassword
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .profile-page {
    padding: var(--spacing-xl) 0;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: var(--spacing-lg);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        color: white;
        font-size: var(--font-size-xxl);
        font-weight: var(--font-weight-bold);
      }
    }
    
    .profile-info {
      h1 {
        margin-bottom: var(--spacing-sm);
        color: var(--text-primary);
      }
      
      p {
        color: var(--text-secondary);
      }
    }
  }
  
  .profile-tabs {
    display: flex;
    margin-bottom: var(--spacing-xl);
    border-bottom: 1px solid var(--bg-tertiary);
    
    button {
      padding: var(--spacing-sm) var(--spacing-lg);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
      transition: color var(--transition-fast);
      
      &.active {
        color: var(--accent-primary);
        border-bottom: 2px solid var(--accent-primary);
      }
      
      &:hover {
        color: var(--text-primary);
      }
    }
  }
  
  .profile-content {
    .form-group {
      margin-bottom: var(--spacing-md);
      
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-secondary);
      }
      
      input {
        width: 100%;
        padding: var(--spacing-sm);
        border: 2px solid var(--bg-tertiary);
        border-radius: var(--border-radius-md);
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }
    }
    
    .settings-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      
      .toggle-switch {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        
        input[type="checkbox"] {
          appearance: none;
          width: 40px;
          height: 20px;
          background-color: var(--bg-tertiary);
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          
          &::before {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: white;
            top: 2px;
            left: 2px;
            transition: transform var(--transition-fast);
          }
          
          &:checked {
            background-color: var(--accent-primary);
            
            &::before {
              transform: translateX(20px);
            }
          }
        }
      }
    }
  }
  </style>