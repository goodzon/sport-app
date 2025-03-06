const pool = require('../config/database');

/**
 * Получение всех плейлистов с пагинацией
 */
exports.getAllPlaylists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Опционально: фильтрация по типу тренировки
    const workoutType = req.query.workoutType;
    const intensity = req.query.intensity;
    
    // Параметры и условия запроса
    const params = [];
    let whereClause = '';
    let paramIndex = 1;
    
    if (workoutType) {
      whereClause += ` WHERE p.workout_type = $${paramIndex}`;
      params.push(workoutType);
      paramIndex++;
    }
    
    if (intensity) {
      whereClause += whereClause ? ` AND p.intensity = $${paramIndex}` : ` WHERE p.intensity = $${paramIndex}`;
      params.push(intensity);
      paramIndex++;
    }
    
    // Запрос на получение плейлистов
    const playlistsQuery = `
      SELECT 
        p.id, p.name, p.description, p.bpm, p.duration, p.workout_type, p.intensity, p.image_url,
        g.id as genre_id, g.name as genre_name, g.slug as genre_slug,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as tracks_count
      FROM 
        playlists p
      JOIN 
        music_genres g ON p.genre_id = g.id
      ${whereClause}
      ORDER BY 
        p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Запрос на получение общего количества плейлистов
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM playlists p
      ${whereClause}
    `;
    
    // Добавляем параметры для LIMIT и OFFSET
    params.push(limit, offset);
    
    // Выполняем оба запроса параллельно
    const [playlistsResult, countResult] = await Promise.all([
      pool.query(playlistsQuery, params),
      pool.query(countQuery, params.slice(0, paramIndex - 1))
    ]);
    
    const playlists = playlistsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: playlists,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение плейлиста по ID с треками
 */
exports.getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Получаем информацию о плейлисте
    const playlistQuery = `
      SELECT 
        p.id, p.name, p.description, p.bpm, p.duration, p.workout_type, p.intensity, p.image_url,
        g.id as genre_id, g.name as genre_name, g.slug as genre_slug
      FROM 
        playlists p
      JOIN 
        music_genres g ON p.genre_id = g.id
      WHERE 
        p.id = $1
    `;
    
    // Получаем треки плейлиста
    const tracksQuery = `
      SELECT 
        t.id, t.title, t.artist, t.duration, t.bpm, t.audio_url,
        pt.position
      FROM 
        tracks t
      JOIN 
        playlist_tracks pt ON t.id = pt.track_id
      WHERE 
        pt.playlist_id = $1
      ORDER BY 
        pt.position ASC
    `;
    
    // Проверяем статус избранного, если пользователь авторизован
    const favoriteQuery = `
      SELECT 1 FROM user_favorite_playlists
      WHERE user_id = $1 AND playlist_id = $2
    `;
    
    // Выполняем запросы параллельно
    const [playlistResult, tracksResult] = await Promise.all([
      pool.query(playlistQuery, [id]),
      pool.query(tracksQuery, [id])
    ]);
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Плейлист не найден'
      });
    }
    
    // Получаем статус избранного, если пользователь авторизован
    let isFavorite = false;
    if (req.user) {
      const favoriteResult = await pool.query(favoriteQuery, [req.user.id, id]);
      isFavorite = favoriteResult.rows.length > 0;
    }
    
    const playlist = playlistResult.rows[0];
    const tracks = tracksResult.rows;
    
    res.status(200).json({
      success: true,
      data: {
        ...playlist,
        tracks,
        isFavorite
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение всех жанров музыки
 */
exports.getAllGenres = async (req, res, next) => {
  try {
    const query = `
      SELECT id, name, slug, description 
      FROM music_genres 
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение плейлистов по жанру
 */
exports.getPlaylistsByGenre = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Получаем информацию о жанре
    const genreQuery = `
      SELECT id, name, slug, description
      FROM music_genres
      WHERE slug = $1
    `;
    
    // Получаем плейлисты по жанру
    const playlistsQuery = `
      SELECT 
        p.id, p.name, p.description, p.bpm, p.duration, p.workout_type, p.intensity, p.image_url,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as tracks_count
      FROM 
        playlists p
      JOIN 
        music_genres g ON p.genre_id = g.id
      WHERE 
        g.slug = $1
      ORDER BY 
        p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    // Запрос на получение общего количества плейлистов по жанру
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM playlists p
      JOIN music_genres g ON p.genre_id = g.id
      WHERE g.slug = $1
    `;
    
    // Выполняем все запросы параллельно
    const [genreResult, playlistsResult, countResult] = await Promise.all([
      pool.query(genreQuery, [slug]),
      pool.query(playlistsQuery, [slug, limit, offset]),
      pool.query(countQuery, [slug])
    ]);
    
    if (genreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Жанр не найден'
      });
    }
    
    const genre = genreResult.rows[0];
    const playlists = playlistsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: {
        genre,
        playlists
      },
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Добавление плейлиста в избранное
 */
exports.addToFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Проверяем существование плейлиста
    const playlistQuery = 'SELECT id FROM playlists WHERE id = $1';
    const playlistResult = await pool.query(playlistQuery, [id]);
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Плейлист не найден'
      });
    }
    
    // Проверяем, не добавлен ли плейлист уже в избранное
    const checkQuery = 'SELECT * FROM user_favorite_playlists WHERE user_id = $1 AND playlist_id = $2';
    const checkResult = await pool.query(checkQuery, [userId, id]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Плейлист уже добавлен в избранное'
      });
    }
    
    // Добавляем плейлист в избранное
    const insertQuery = 'INSERT INTO user_favorite_playlists (user_id, playlist_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, id]);
    
    res.status(201).json({
      success: true,
      message: 'Плейлист успешно добавлен в избранное'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление плейлиста из избранного
 */
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Удаляем плейлист из избранного
    const deleteQuery = 'DELETE FROM user_favorite_playlists WHERE user_id = $1 AND playlist_id = $2';
    const result = await pool.query(deleteQuery, [userId, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Плейлист не найден в избранном'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Плейлист успешно удален из избранного'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение избранных плейлистов пользователя
 */
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.id, p.name, p.description, p.bpm, p.duration, p.workout_type, p.intensity, p.image_url,
        g.id as genre_id, g.name as genre_name, g.slug as genre_slug,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as tracks_count,
        f.created_at as added_at
      FROM 
        user_favorite_playlists f
      JOIN 
        playlists p ON f.playlist_id = p.id
      JOIN 
        music_genres g ON p.genre_id = g.id
      WHERE 
        f.user_id = $1
      ORDER BY 
        f.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Поиск плейлистов
 */
exports.searchPlaylists = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Поисковый запрос не может быть пустым'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Поиск плейлистов
    const searchQuery = `
      SELECT 
        p.id, p.name, p.description, p.bpm, p.duration, p.workout_type, p.intensity, p.image_url,
        g.id as genre_id, g.name as genre_name, g.slug as genre_slug,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as tracks_count,
        ts_rank(to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('russian', $1)) as rank
      FROM 
        playlists p
      JOIN 
        music_genres g ON p.genre_id = g.id
      WHERE 
        to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('russian', $1)
        OR p.workout_type ILIKE $2
        OR p.intensity ILIKE $2
      ORDER BY 
        rank DESC
      LIMIT $3 OFFSET $4
    `;
    
    // Запрос на получение общего количества найденных плейлистов
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM playlists p
      WHERE 
        to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('russian', $1)
        OR p.workout_type ILIKE $2
        OR p.intensity ILIKE $2
    `;
    
    // Выполняем оба запроса параллельно
    const [playlistsResult, countResult] = await Promise.all([
      pool.query(searchQuery, [query, `%${query}%`, limit, offset]),
      pool.query(countQuery, [query, `%${query}%`])
    ]);
    
    const playlists = playlistsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: playlists,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        query
      }
    });
  } catch (error) {
    next(error);
  }
};