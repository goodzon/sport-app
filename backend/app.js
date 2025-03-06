const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

// Инициализация приложения
const app = express();

// Middleware
app.use(helmet()); // Безопасность
app.use(compression()); // Сжатие ответов
app.use(cors()); // CORS для фронтенда
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных
app.use(morgan('dev')); // Логирование запросов

// Основные маршруты
app.use('/api', apiRoutes);

// Маршрут для проверки работоспособности API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка ошибок
app.use(errorHandler);

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

module.exports = app;