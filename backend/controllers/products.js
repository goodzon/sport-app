const pool = require('../config/database');

// Получение всех продуктов с пагинацией
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    
    // Параметры сортировки
    const validSortColumns = ['name', 'proteins', 'fats', 'carbs', 'calories', 'water'];
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'name';
    
    // Запрос на получение продуктов
    const productsQuery = `
      SELECT 
        p.id, p.name, p.proteins, p.fats, p.carbs, p.calories, p.water, 
        p.serving_size, p.image_url, p.description,
        c.id as category_id, c.name as category_name, c.slug as category_slug 
      FROM 
        products p
      JOIN 
        product_categories c ON p.category_id = c.id
      WHERE 
        p.is_active = true
      ORDER BY 
        p.${orderBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    
    // Запрос на получение общего количества продуктов
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE is_active = true
    `;
    
    // Выполняем оба запроса параллельно
    const [productsResult, countResult] = await Promise.all([
      pool.query(productsQuery, [limit, offset]),
      pool.query(countQuery)
    ]);
    
    const products = productsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: products,
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

// Получение продукта по ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.id, p.name, p.proteins, p.fats, p.carbs, p.calories, p.water, 
        p.serving_size, p.image_url, p.description,
        c.id as category_id, c.name as category_name, c.slug as category_slug 
      FROM 
        products p
      JOIN 
        product_categories c ON p.category_id = c.id
      WHERE 
        p.id = $1 AND p.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Получение всех категорий
exports.getAllCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT id, name, slug, description 
      FROM product_categories 
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

// Получение продуктов по категории
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    
    // Параметры сортировки
    const validSortColumns = ['name', 'proteins', 'fats', 'carbs', 'calories', 'water'];
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'name';
    
    // Запрос на получение продуктов по категории
    const productsQuery = `
      SELECT 
        p.id, p.name, p.proteins, p.fats, p.carbs, p.calories, p.water, 
        p.serving_size, p.image_url, p.description
      FROM 
        products p
      JOIN 
        product_categories c ON p.category_id = c.id
      WHERE 
        c.slug = $1 AND p.is_active = true
      ORDER BY 
        p.${orderBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    // Запрос на получение общего количества продуктов в категории
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      JOIN product_categories c ON p.category_id = c.id
      WHERE c.slug = $1 AND p.is_active = true
    `;
    
    // Запрос на получение информации о категории
    const categoryQuery = `
      SELECT id, name, slug, description
      FROM product_categories
      WHERE slug = $1
    `;
    
    // Выполняем все запросы параллельно
    const [productsResult, countResult, categoryResult] = await Promise.all([
      pool.query(productsQuery, [slug, limit, offset]),
      pool.query(countQuery, [slug]),
      pool.query(categoryQuery, [slug])
    ]);
    
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }
    
    const products = productsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const category = categoryResult.rows[0];
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: {
        category,
        products
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

// Поиск продуктов
exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Поисковый запрос не может быть пустым'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Поиск с использованием полнотекстового поиска PostgreSQL
    const searchQuery = `
      SELECT 
        p.id, p.name, p.proteins, p.fats, p.carbs, p.calories, p.water, 
        p.serving_size, p.image_url, p.description,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        ts_rank(to_tsvector('russian', p.name), plainto_tsquery('russian', $1)) as rank
      FROM 
        products p
      JOIN 
        product_categories c ON p.category_id = c.id
      WHERE 
        to_tsvector('russian', p.name) @@ plainto_tsquery('russian', $1)
        AND p.is_active = true
      ORDER BY 
        rank DESC
      LIMIT $2 OFFSET $3
    `;
    
    // Запрос на получение общего количества найденных продуктов
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      WHERE 
        to_tsvector('russian', p.name) @@ plainto_tsquery('russian', $1)
        AND p.is_active = true
    `;
    
    // Выполняем оба запроса параллельно
    const [productsResult, countResult] = await Promise.all([
      pool.query(searchQuery, [query, limit, offset]),
      pool.query(countQuery, [query])
    ]);
    
    const products = productsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Формируем мета-информацию для пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      data: products,
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

// Добавление продукта в избранное
exports.addToFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Получаем ID пользователя из middleware аутентификации
    
    // Проверяем существование продукта
    const productQuery = 'SELECT id FROM products WHERE id = $1 AND is_active = true';
    const productResult = await pool.query(productQuery, [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }
    
    // Проверяем, не добавлен ли продукт уже в избранное
    const checkQuery = 'SELECT * FROM user_favorite_products WHERE user_id = $1 AND product_id = $2';
    const checkResult = await pool.query(checkQuery, [userId, id]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Продукт уже добавлен в избранное'
      });
    }
    
    // Добавляем продукт в избранное
    const insertQuery = 'INSERT INTO user_favorite_products (user_id, product_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, id]);
    
    res.status(201).json({
      success: true,
      message: 'Продукт успешно добавлен в избранное'
    });
  } catch (error) {
    next(error);
  }
};

// Удаление продукта из избранного
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Получаем ID пользователя из middleware аутентификации
    
    // Удаляем продукт из избранного
    const deleteQuery = 'DELETE FROM user_favorite_products WHERE user_id = $1 AND product_id = $2';
    const result = await pool.query(deleteQuery, [userId, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден в избранном'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Продукт успешно удален из избранного'
    });
  } catch (error) {
    next(error);
  }
};

// Получение избранных продуктов пользователя
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id; // Получаем ID пользователя из middleware аутентификации
    
    const query = `
      SELECT 
        p.id, p.name, p.proteins, p.fats, p.carbs, p.calories, p.water, 
        p.serving_size, p.image_url, p.description,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        f.created_at as added_at
      FROM 
        user_favorite_products f
      JOIN 
        products p ON f.product_id = p.id
      JOIN 
        product_categories c ON p.category_id = c.id
      WHERE 
        f.user_id = $1 AND p.is_active = true
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