const winston = require('winston');

// Определяем уровни логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Определяем цвета для уровней логирования (для консоли)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'white',
};

// Добавляем цвета в Winston
winston.addColors(colors);

// Определяем формат для логов
const format = winston.format.combine(
  // Добавляем метку времени
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Обрабатываем ошибки
  winston.format.errors({ stack: true }),
  // Добавляем цвета (для консоли)
  winston.format.colorize({ all: true }),
  // Форматируем вывод
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Определяем транспорты для вывода логов
const transports = [
  // Вывод в консоль
  new winston.transports.Console(),
  // Вывод в файл с ошибками
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Вывод в общий файл с логами
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Создаем инстанс logger'а
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Мидлварь для логирования HTTP запросов
const httpLogger = (req, res, next) => {
  // Логируем только в dev-режиме
  if (process.env.NODE_ENV !== 'production') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
      );
    });
  }
  next();
};

module.exports = {
  logger,
  httpLogger,
};