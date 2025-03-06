<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-toast"
        :class="[
          `notification-${notification.type || 'info'}`,
          { 'with-progress': notification.timeout > 0 }
        ]"
      >
        <!-- Иконка уведомления -->
        <div class="notification-icon">
          <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <!-- Содержимое уведомления -->
        <div class="notification-content">
          <div class="notification-title" v-if="notification.title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
        </div>
        
        <!-- Кнопка закрытия -->
        <button
          class="notification-close"
          @click="closeNotification(notification.id)"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Прогресс-бар для автоматического закрытия -->
        <div
          v-if="notification.timeout > 0"
          class="notification-progress"
          :style="{ animationDuration: `${notification.timeout}ms` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'NotificationToast',
  
  setup() {
    const store = useStore()
    
    // Получаем уведомления из хранилища
    const notifications = computed(() => store.state.app.notifications)
    
    // Закрытие уведомления
    const closeNotification = (id) => {
      store.commit('app/REMOVE_NOTIFICATION', id)
    }
    
    return {
      notifications,
      closeNotification
    }
  }
}
</script>

<style lang="scss" scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-index-tooltip);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  background-color: var(--bg-elevated);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  
  &.with-progress {
    padding-bottom: calc(var(--spacing-md) + 4px);
  }
  
  // Цвета уведомлений по типам
  &.notification-success {
    border-left: 4px solid var(--color-success);
    
    .notification-icon {
      color: var(--color-success);
    }
  }
  
  &.notification-error {
    border-left: 4px solid var(--color-error);
    
    .notification-icon {
      color: var(--color-error);
    }
  }
  
  &.notification-warning {
    border-left: 4px solid var(--color-warning);
    
    .notification-icon {
      color: var(--color-warning);
    }
  }
  
  &.notification-info {
    border-left: 4px solid var(--color-info);
    
    .notification-icon {
      color: var(--color-info);
    }
  }
}

.notification-icon {
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  margin-right: var(--spacing-md);
}

.notification-title {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.notification-message {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--text-primary);
  }
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: linear-gradient(to right, transparent, var(--accent-primary));
  animation: progress-bar linear forwards;
  transform-origin: left;
}

@keyframes progress-bar {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}

// Анимации для transition-group
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>