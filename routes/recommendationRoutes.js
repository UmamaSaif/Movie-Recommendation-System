const express = require('express');
const auth = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

router.use(auth.protect); // All recommendation routes require authentication

router.get('/personalized', recommendationController.getPersonalizedRecommendations);
router.get('/similar/:movieId', recommendationController.getSimilarMovies);
router.get('/trending', recommendationController.getTrendingMovies);
router.get('/top-rated', recommendationController.getTopRatedMovies);

module.exports = router;