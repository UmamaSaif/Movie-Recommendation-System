const express = require('express');
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', movieController.getAllMovies);
router.get('/search', movieController.searchMovies);
router.get('/filter', movieController.filterMovies);
router.get('/top', movieController.getTopMovies);
router.get('/:id', movieController.getMovie);




// Protected routes
router.use(authMiddleware.protect);

// Regular user routes
router.post('/:id/trivia', movieController.addTrivia);
router.post('/:id/goofs', movieController.addGoof);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));
router.post('/', movieController.createMovie);
router.patch('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);
router.post('/:id/soundtrack', movieController.addSoundtrack);

module.exports = router;