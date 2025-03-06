const { check, validationResult } = require('express-validator');

// Общий middleware для валидации запросов
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

// Валидаторы для регистрации пользователя
const registerValidators = [
  check('username', 'Имя пользователя обязательно').not().isEmpty(),
  check('username', 'Имя пользователя должно быть от 3 до 20 символов').isLength({ min: 3, max: 20 }),
  check('email', 'Укажите корректный email').isEmail(),
  check('password', 'Пароль должен быть не менее 6 символов').isLength({ min: 6 }),
];

// Валидаторы для входа пользователя
const loginValidators = [
  check('email', 'Укажите корректный email').isEmail(),
  check('password', 'Пароль обязателен').exists(),
];

// Валидаторы для обновления пароля
const updatePasswordValidators = [
  check('currentPassword', 'Текущий пароль обязателен').exists(),
  check('newPassword', 'Новый пароль должен быть не менее 6 символов').isLength({ min: 6 }),
];

// Валидаторы для обновления профиля
const updateProfileValidators = [
  check('username', 'Имя пользователя должно быть от 3 до 20 символов').optional().isLength({ min: 3, max: 20 }),
];

// Валидаторы для обновления настроек
const updateSettingsValidators = [
  check('darkMode', 'Значение darkMode должно быть булевым').optional().isBoolean(),
  check('notificationsEnabled', 'Значение notificationsEnabled должно быть булевым').optional().isBoolean(),
  check('autoPlayMusic', 'Значение autoPlayMusic должно быть булевым').optional().isBoolean(),
  check('language', 'Значение language должно быть строкой').optional().isString(),
];

// Валидаторы для параметров пагинации
const paginationValidators = [
  check('page', 'Номер страницы должен быть положительным числом').optional().isInt({ min: 1 }),
  check('limit', 'Лимит элементов должен быть положительным числом').optional().isInt({ min: 1, max: 100 }),
];

// Валидаторы для поискового запроса
const searchValidators = [
  check('query', 'Поисковый запрос не может быть пустым').not().isEmpty(),
];

module.exports = {
  validate,
  registerValidators,
  loginValidators,
  updatePasswordValidators,
  updateProfileValidators,
  updateSettingsValidators,
  paginationValidators,
  searchValidators,
};