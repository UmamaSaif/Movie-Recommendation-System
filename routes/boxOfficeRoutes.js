const express = require('express');
const boxOfficeController = require('../controllers/boxOfficeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/top-grossing', boxOfficeController.getTopGrossing);
router.get('/:movieId', boxOfficeController.getMovieBoxOffice);
router.patch('/:movieId',
  auth.protect,
  auth.restrictTo('admin', 'editor'),
  boxOfficeController.updateBoxOffice
);

module.exports = router;