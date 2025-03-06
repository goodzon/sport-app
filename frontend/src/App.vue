<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <app-header />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <app-footer />
    <notification-toast />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import NotificationToast from '@/components/common/NotificationToast.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    NotificationToast
  },
  setup() {
    const store = useStore()
    
    const isDarkTheme = computed(() => store.state.app.darkMode)
    
    return {
      isDarkTheme
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/styles/variables.scss';
@import '@/assets/styles/animations.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

// Темная тема активирована по умолчанию
html {
  background-color: var(--bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>