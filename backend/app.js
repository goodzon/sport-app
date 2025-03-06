const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const { httpLogger, logger } = require('./utils/logger');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config();

// Инициализация приложения
const app = express();

// Middleware
app.use(helmet()); // Безопасность
app.use(compression()); // Сжатие ответов
app.use(cors()); // CORS для фронтенда
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// Логирование запросов
app.use(httpLogger);

// Статические файлы (если нужны)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Основные маршруты
app.use('/api', apiRoutes);

// Маршрут для проверки работоспособности API
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Обработка ошибок
app.use(errorHandler);

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Маршрут не найден' 
  });
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Необработанное отклонение промиса: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Необработанное исключение: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

module.exports = app;