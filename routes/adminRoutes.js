const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Movie Management
router.post('/movies', adminController.addMovie);
router.patch('/movies/:id', adminController.updateMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// Review Moderation
router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/moderate', adminController.moderateReview);

// Statistics and Insights
router.get('/statistics', adminController.getSiteStatistics);
router.get('/user-engagement', adminController.getUserEngagementMetrics);

module.exports = router;