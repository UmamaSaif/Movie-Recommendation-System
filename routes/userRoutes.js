const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

//router.use(authMiddleware.protect);

router.patch('/profile', authMiddleware.protect, userController.updateProfile);
router.post('/wishlist', authMiddleware.protect, userController.addToWishlist);
router.delete('/wishlist', authMiddleware.protect, userController.removeFromWishlist);

module.exports = router;