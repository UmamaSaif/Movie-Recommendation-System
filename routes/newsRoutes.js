const express = require('express');
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNews);
router.post('/', auth.protect, auth.restrictTo('admin', 'editor'), newsController.createNews);
router.patch('/:id', auth.protect, auth.restrictTo('admin', 'editor'), newsController.updateNews);
router.delete('/:id', auth.protect, auth.restrictTo('admin'), newsController.deleteNews);

module.exports = router;