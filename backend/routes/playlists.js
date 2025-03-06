const express = require('express');
const router = express.Router();
const playlistsController = require('../controllers/playlists');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты
router.get('/', playlistsController.getAllPlaylists);
router.get('/genres', playlistsController.getAllGenres);
router.get('/search', playlistsController.searchPlaylists);
router.get('/genre/:slug', playlistsController.getPlaylistsByGenre);
router.get('/:id', authMiddleware.optionalToken, playlistsController.getPlaylistById);

// Защищенные маршруты (требуют аутентификации)
router.post('/favorite/:id', authMiddleware.verifyToken, playlistsController.addToFavorites);
router.delete('/favorite/:id', authMiddleware.verifyToken, playlistsController.removeFromFavorites);
router.get('/favorites', authMiddleware.verifyToken, playlistsController.getFavorites);

module.exports = router;