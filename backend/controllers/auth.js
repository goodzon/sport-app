const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Регистрация нового пользователя
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Проверяем, существует ли пользователь с таким email или username
    const checkUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким email или именем уже существует'
      });
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const newUser = await pool.query(
      `INSERT INTO users 
        (username, email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, uuid, username, email, first_name, last_name, avatar_url, created_at`,
      [username, email, hashedPassword, firstName, lastName]
    );

    // Создаем настройки пользователя по умолчанию
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );

    // Генерируем JWT токен
    const token = jwt.sign(
      { id: newUser.rows[0].id, uuid: newUser.rows[0].uuid, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        uuid: newUser.rows[0].uuid,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        avatarUrl: newUser.rows[0].avatar_url,
        createdAt: newUser.rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вход пользователя
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь
    const user = await pool.query(
      'SELECT id, uuid, username, email, password_hash, first_name, last_name, avatar_url, is_active FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверяем, активен ли пользователь
    if (!user.rows[0].is_active) {
      return res.status(403).json({
        success: false,
        message: 'Аккаунт деактивирован. Пожалуйста, обратитесь к администратору'
      });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { id: user.rows[0].id, uuid: user.rows[0].uuid, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        uuid: user.rows[0].uuid,
        username: user.rows[0].username,
        email: user.rows[0].email,
        firstName: user.rows[0].first_name,
        lastName: user.rows[0].last_name,
        avatarUrl: user.rows[0].avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение информации о текущем пользователе
 */
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Получаем информацию о пользователе
    const user = await pool.query(
      `SELECT id, uuid, username, email, first_name, last_name, avatar_url, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Получаем настройки пользователя
    const settings = await pool.query(
      'SELECT dark_mode, notifications_enabled, auto_play_music, language FROM user_settings WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      user: {
        uuid: user.rows[0].uuid,
        username: user.rows[0].username,
        email: user.rows[0].email,
        firstName: user.rows[0].first_name,
        lastName: user.rows[0].last_name,
        avatarUrl: user.rows[0].avatar_url,
        createdAt: user.rows[0].created_at,
        settings: settings.rows[0] || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление пароля пользователя
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Получаем хеш текущего пароля
    const user = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Текущий пароль неверен'
      });
    }

    // Хэшируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Пароль успешно обновлен'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление профиля пользователя
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, username } = req.body;

    // Если указан новый username, проверяем, не занят ли он
    if (username) {
      const checkUsername = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (checkUsername.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Пользователь с таким именем уже существует'
        });
      }
    }

    // Обновляем профиль
    const updatedUser = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           username = COALESCE($3, username)
       WHERE id = $4
       RETURNING id, uuid, username, email, first_name, last_name, avatar_url`,
      [firstName, lastName, username, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: {
        uuid: updatedUser.rows[0].uuid,
        username: updatedUser.rows[0].username,
        email: updatedUser.rows[0].email,
        firstName: updatedUser.rows[0].first_name,
        lastName: updatedUser.rows[0].last_name,
        avatarUrl: updatedUser.rows[0].avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление настроек пользователя
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { darkMode, notificationsEnabled, autoPlayMusic, language } = req.body;

    // Обновляем настройки
    await pool.query(
      `INSERT INTO user_settings (user_id, dark_mode, notifications_enabled, auto_play_music, language)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET dark_mode = COALESCE($2, user_settings.dark_mode),
           notifications_enabled = COALESCE($3, user_settings.notifications_enabled),
           auto_play_music = COALESCE($4, user_settings.auto_play_music),
           language = COALESCE($5, user_settings.language),
           updated_at = CURRENT_TIMESTAMP`,
      [userId, darkMode, notificationsEnabled, autoPlayMusic, language]
    );

    // Получаем обновленные настройки
    const settings = await pool.query(
      'SELECT dark_mode, notifications_enabled, auto_play_music, language FROM user_settings WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Настройки успешно обновлены',
      settings: settings.rows[0]
    });
  } catch (error) {
    next(error);
  }
};