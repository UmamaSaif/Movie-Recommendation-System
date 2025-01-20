const express = require('express');
const awardController = require('../controllers/awardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/year/:year', awardController.getAwardsByYear);
router.get('/movie/:movieId', awardController.getMovieAwards);
router.post('/',
  auth.protect,
  auth.restrictTo('admin', 'editor'),
  awardController.createAward
);
router.patch('/:id',
  auth.protect,
  auth.restrictTo('admin', 'editor'),
  awardController.updateAward
);

module.exports = router;