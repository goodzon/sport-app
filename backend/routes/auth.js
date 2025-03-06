const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Middleware для валидации запросов
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: errors.array()
    });
  }
  next();
};

// Регистрация нового пользователя
router.post(
  '/register',
  [
    check('username', 'Имя пользователя обязательно').not().isEmpty(),
    check('username', 'Имя пользователя должно быть от 3 до 20 символов').isLength({ min: 3, max: 20 }),
    check('email', 'Укажите корректный email').isEmail(),
    check('password', 'Пароль должен быть не менее 6 символов').isLength({ min: 6 }),
    validate
  ],
  authController.register
);

// Вход пользователя
router.post(
  '/login',
  [
    check('email', 'Укажите корректный email').isEmail(),
    check('password', 'Пароль обязателен').exists(),
    validate
  ],
  authController.login
);

// Получение информации о текущем пользователе
router.get('/me', authMiddleware.verifyToken, authController.getMe);

// Обновление пароля пользователя
router.put(
  '/password',
  [
    authMiddleware.verifyToken,
    check('currentPassword', 'Текущий пароль обязателен').exists(),
    check('newPassword', 'Новый пароль должен быть не менее 6 символов').isLength({ min: 6 }),
    validate
  ],
  authController.updatePassword
);

// Обновление профиля пользователя
router.put(
  '/profile',
  [
    authMiddleware.verifyToken,
    check('username', 'Имя пользователя должно быть от 3 до 20 символов').optional().isLength({ min: 3, max: 20 }),
    validate
  ],
  authController.updateProfile
);

// Обновление настроек пользователя
router.put(
  '/settings',
  authMiddleware.verifyToken,
  authController.updateSettings
);

module.exports = router;