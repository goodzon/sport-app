// Определение маршрутов приложения
export default [
    // Главная страница
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomePage.vue'),
      meta: {
        title: 'Главная | FitBeast'
      }
    },
    
    // Страница продуктов
    {
      path: '/products',
      name: 'Products',
      component: () => import('@/views/ProductsPage.vue'),
      meta: {
        title: 'Продукты | FitBeast'
      }
    },
    
    // Детальная страница продукта
    {
      path: '/products/:id',
      name: 'ProductDetail',
      component: () => import('@/views/ProductDetailPage.vue'),
      props: true,
      meta: {
        title: 'Подробно о продукте | FitBeast'
      }
    },
    
    // Страница плейлистов
    {
      path: '/playlists',
      name: 'Playlists',
      component: () => import('@/views/PlaylistsPage.vue'),
      meta: {
        title: 'Плейлисты | FitBeast'
      }
    },
    
    // Детальная страница плейлиста
    {
      path: '/playlists/:id',
      name: 'PlaylistDetail',
      component: () => import('@/views/PlaylistDetailPage.vue'),
      props: true,
      meta: {
        title: 'Подробно о плейлисте | FitBeast'
      }
    },
    
    // Страница входа
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        title: 'Вход | FitBeast',
        guest: true // Этот маршрут доступен только гостям
      }
    },
    
    // Страница регистрации
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterPage.vue'),
      meta: {
        title: 'Регистрация | FitBeast',
        guest: true // Этот маршрут доступен только гостям
      }
    },
    
    // Страница профиля (защищенная)
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: {
        title: 'Профиль | FitBeast',
        requiresAuth: true // Этот маршрут требует аутентификации
      }
    },
    
    // Страница избранных продуктов (защищенная)
    {
      path: '/favorites/products',
      name: 'FavoriteProducts',
      component: () => import('@/views/FavoriteProductsPage.vue'),
      meta: {
        title: 'Избранные продукты | FitBeast',
        requiresAuth: true
      }
    },
    
    // Страница избранных плейлистов (защищенная)
    {
      path: '/favorites/playlists',
      name: 'FavoritePlaylists',
      component: () => import('@/views/FavoritePlaylistsPage.vue'),
      meta: {
        title: 'Избранные плейлисты | FitBeast',
        requiresAuth: true
      }
    },
    
    // Страница "Не найдено" (404)
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundPage.vue'),
      meta: {
        title: 'Страница не найдена | FitBeast'
      }
    }
  ];