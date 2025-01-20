const express = require('express');
const releaseController = require('../controllers/releaseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', releaseController.getUpcoming);
router.post('/', auth.protect, auth.restrictTo('admin'), releaseController.createRelease);
router.post('/:id/subscribe', auth.protect, releaseController.subscribeToRelease);

module.exports = router;
