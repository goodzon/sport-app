const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fitbeast',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Проверка подключения к базе данных
pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
  } else {
    console.log('Успешное подключение к базе данных PostgreSQL');
    release();
  }
});

// Экспорт пула для использования в моделях
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};