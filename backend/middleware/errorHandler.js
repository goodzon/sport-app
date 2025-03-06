/**
 * Глобальный обработчик ошибок для Express
 */
const errorHandler = (err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    
    // Кастомное сообщение об ошибке, если оно есть
    const message = err.message || 'Внутренняя ошибка сервера';
    
    // Определяем HTTP статус ошибки
    const statusCode = err.statusCode || 500;
    
    // Определяем, включать ли стек ошибки в ответ (только в режиме разработки)
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    
    // Обрабатываем ошибки Postgres
    if (err.code && err.code.startsWith('P')) {
      if (err.code === 'P0001') {  // Ошибка CHECK constraint
        return res.status(400).json({
          success: false,
          message: 'Ошибка проверки данных в базе данных',
          error: message
        });
      }
      
      if (err.code === 'P0002') {  // Ошибка NOT NULL constraint
        return res.status(400).json({
          success: false,
          message: 'Обязательное поле отсутствует',
          error: message
        });
      }
      
      if (err.code === '23505') {  // Ошибка уникальности (UNIQUE constraint)
        return res.status(409).json({
          success: false,
          message: 'Запись с такими данными уже существует',
          error: message
        });
      }
    }
    
    // Обрабатываем ошибки валидации
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        error: message,
        details: err.errors
      });
    }
    
    // Обрабатываем ошибки JsonWebToken
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Ошибка аутентификации',
        error: message
      });
    }
    
    // Общий ответ для всех остальных ошибок
    res.status(statusCode).json({
      success: false,
      message,
      ...(stack && { stack })
    });
  };
  
  module.exports = errorHandler;