#!/bin/bash

# Создание корневой папки проекта
mkdir -p frontend

# Создание папки public и её структуры
mkdir -p frontend/public/img/icons
mkdir -p frontend/public/img/backgrounds
touch frontend/public/index.html
touch frontend/public/favicon.ico

# Создание папки src и её структуры
mkdir -p frontend/src/assets/fonts
mkdir -p frontend/src/assets/images
mkdir -p frontend/src/assets/styles
touch frontend/src/assets/styles/variables.scss
touch frontend/src/assets/styles/mixins.scss
touch frontend/src/assets/styles/global.scss
touch frontend/src/assets/styles/animations.scss

mkdir -p frontend/src/components/common
touch frontend/src/components/common/AppHeader.vue
touch frontend/src/components/common/AppFooter.vue
touch frontend/src/components/common/LoadingSpinner.vue
touch frontend/src/components/common/NotificationToast.vue

mkdir -p frontend/src/components/products
touch frontend/src/components/products/ProductCard.vue
touch frontend/src/components/products/ProductList.vue
touch frontend/src/components/products/ProductFilter.vue
touch frontend/src/components/products/ProductSearch.vue

mkdir -p frontend/src/components/playlists
touch frontend/src/components/playlists/PlaylistCard.vue
touch frontend/src/components/playlists/PlaylistList.vue
touch frontend/src/components/playlists/MusicPlayer.vue

mkdir -p frontend/src/components/auth
touch frontend/src/components/auth/LoginForm.vue
touch frontend/src/components/auth/RegisterForm.vue

mkdir -p frontend/src/composables
touch frontend/src/composables/useProducts.js
touch frontend/src/composables/usePlaylists.js
touch frontend/src/composables/useAuth.js
touch frontend/src/composables/useTheme.js

mkdir -p frontend/src/router
touch frontend/src/router/index.js
touch frontend/src/router/routes.js

mkdir -p frontend/src/store/modules
touch frontend/src/store/index.js
touch frontend/src/store/modules/products.js
touch frontend/src/store/modules/playlists.js
touch frontend/src/store/modules/auth.js
touch frontend/src/store/modules/app.js

mkdir -p frontend/src/views
touch frontend/src/views/HomePage.vue
touch frontend/src/views/ProductsPage.vue
touch frontend/src/views/ProductDetailPage.vue
touch frontend/src/views/PlaylistsPage.vue
touch frontend/src/views/PlaylistDetailPage.vue
touch frontend/src/views/LoginPage.vue
touch frontend/src/views/RegisterPage.vue
touch frontend/src/views/ProfilePage.vue
touch frontend/src/views/NotFoundPage.vue

mkdir -p frontend/src/services
touch frontend/src/services/api.js
touch frontend/src/services/productsService.js
touch frontend/src/services/playlistsService.js
touch frontend/src/services/authService.js

mkdir -p frontend/src/utils
touch frontend/src/utils/formatters.js
touch frontend/src/utils/validators.js

# Файлы в папке src
touch frontend/src/main.js
touch frontend/src/App.vue

# Файлы в корне проекта
touch frontend/package.json
touch frontend/vue.config.js
touch frontend/.env
touch frontend/.env.development
touch frontend/.env.production

echo "Структура проекта создана!"

