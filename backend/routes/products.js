const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты
router.get('/', productsController.getAllProducts);
router.get('/categories', productsController.getAllCategories);
router.get('/category/:slug', productsController.getProductsByCategory);
router.get('/:id', productsController.getProductById);
router.get('/search', productsController.searchProducts);

// Защищенные маршруты (требуют аутентификации)
router.post('/favorite/:id', authMiddleware.verifyToken, productsController.addToFavorites);
router.delete('/favorite/:id', authMiddleware.verifyToken, productsController.removeFromFavorites);
router.get('/favorites', authMiddleware.verifyToken, productsController.getFavorites);

module.exports = router;