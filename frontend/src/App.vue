<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <header class="app-header">
      <div class="logo">FitBeast</div>
      <nav>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/playlists">Playlists</a>
      </nav>
    </header>
    
    <main class="app-main">
      <router-view></router-view>
    </main>
    
    <footer class="app-footer">
      &copy; 2025 FitBeast
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const isDarkTheme = computed(() => store.state.app && store.state.app.darkMode)
    
    return {
      isDarkTheme
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #121212;
  color: #ffffff;
}

.dark-theme {
  background-color: #121212;
  color: #ffffff;
}

.app-header {
  padding: 1rem;
  background-color: #1e1e1e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #fc3565 0%, #9b59b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: #b3b3b3;
  text-decoration: none;
}

nav a:hover {
  color: #ffffff;
}

.app-main {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  padding: 1rem;
  background-color: #1e1e1e;
  text-align: center;
  color: #747474;
}
</style>
