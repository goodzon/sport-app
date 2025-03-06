const express = require('express');
const router = express.Router();

const productsRoutes = require('./products');
const playlistsRoutes = require('./playlists');
const authRoutes = require('./auth');

// Маршруты API
router.use('/products', productsRoutes);
router.use('/playlists', playlistsRoutes);
router.use('/auth', authRoutes);

module.exports = router;