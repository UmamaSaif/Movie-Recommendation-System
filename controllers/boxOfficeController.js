const BoxOffice = require('../models/BoxOffice');
const catchAsync = require('../utils/catchAsync');

exports.getMovieBoxOffice = catchAsync(async (req, res) => {
  const boxOffice = await BoxOffice.findOne({ movie: req.params.movieId })
    .populate('movie', 'title releaseDate');

  if (!boxOffice) {
    return res.status(404).json({
      status: 'fail',
      message: 'No box office data found for this movie'
    });
  }

  res.status(200).json({
    status: 'success',
    data: boxOffice
  });
});

exports.updateBoxOffice = catchAsync(async (req, res) => {
  const boxOffice = await BoxOffice.findOneAndUpdate(
    { movie: req.params.movieId },
    { 
      ...req.body,
      lastUpdated: Date.now()
    },
    {
      new: true,
      runValidators: true,
      upsert: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: boxOffice
  });
});

exports.getTopGrossing = catchAsync(async (req, res) => {
  const boxOffice = await BoxOffice.find()
    .sort({ 'totalEarnings.domestic': -1 })
    .limit(10)
    .populate('movie', 'title releaseDate');

  res.status(200).json({
    status: 'success',
    data: boxOffice
  });
});