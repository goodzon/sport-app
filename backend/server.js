const app = require('./app');
const http = require('http');

// Получаем порт из переменной окружения или используем 3000 по умолчанию
const PORT = process.env.PORT || 3000;

// Создаем HTTP сервер
const server = http.createServer(app);

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  console.error('Необработанное исключение:', err);
  process.exit(1);
});

// Обработка отклоненных промисов
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', reason);
});