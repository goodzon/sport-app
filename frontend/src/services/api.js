import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 секунд таймаут для запросов
});

// Добавляем перехватчик запросов
api.interceptors.request.use(
  config => {
    // Добавляем заголовок с токеном, если он есть в localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов
api.interceptors.response.use(
  response => {
    // Возвращаем данные из ответа
    return response.data;
  },
  error => {
    // Обрабатываем ошибки
    if (error.response) {
      // Ошибка с ответом от сервера (HTTP статус не 2xx)
      console.error('API Error:', error.response.data);
      
      // Если статус 401 (Unauthorized), перенаправляем на страницу логина
      if (error.response.status === 401) {
        // Если это не запрос на вход или регистрацию
        if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
          console.log('Unauthorized, redirecting to login');
          
          // Очищаем токен и данные пользователя
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Перенаправляем на страницу логина
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('API Request Error:', error.request);
    } else {
      // Ошибка при настройке запроса
      console.error('API Config Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Функция для установки токена аутентификации
const setAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Функция для удаления токена аутентификации
const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default {
  // Экспортируем экземпляр axios
  api,
  
  // Экспортируем функции для работы с токеном
  setAuthToken,
  removeAuthToken,
  
  // Общие методы для работы с API
  get(url, config = {}) {
    return api.get(url, config);
  },
  
  post(url, data = {}, config = {}) {
    return api.post(url, data, config);
  },
  
  put(url, data = {}, config = {}) {
    return api.put(url, data, config);
  },
  
  delete(url, config = {}) {
    return api.delete(url, config);
  },
  
  // Метод для обработки параметров запроса (пагинация, сортировка и т.д.)
  buildQueryParams(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Добавляем все параметры в URLSearchParams
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString();
  }
};