const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки наличия и валидности JWT токена
 */
exports.verifyToken = (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Токен авторизации отсутствует'
      });
    }
    
    // Проверяем формат заголовка "Bearer [token]"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Неверный формат токена'
      });
    }
    
    const token = parts[1];
    
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавляем информацию о пользователе к объекту запроса
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Срок действия токена истек. Пожалуйста, войдите снова'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке аутентификации'
    });
  }
};

/**
 * Middleware для проверки прав администратора
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Пользователь не аутентифицирован'
    });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора'
    });
  }
  
  next();
};

/**
 * Опциональная проверка токена
 * Если токен есть и он валидный, информация о пользователе будет добавлена к запросу,
 * но если токена нет или он невалидный, запрос все равно будет обработан
 */
exports.optionalToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }
    
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
  } catch (error) {
    // Если токен невалидный, просто игнорируем
    console.log('Опциональная проверка токена:', error.message);
  }
  
  next();
};