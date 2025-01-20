const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.patch('/:id/helpful', reviewController.markHelpful);
router.patch('/:id/unhelpful', reviewController.markUnhelpful);

router.get('/movie/:movieId', reviewController.getReviews);
router.get('/movie/:movieId/top', reviewController.getTopReviews);

router.use(authMiddleware.protect);

module.exports = router;