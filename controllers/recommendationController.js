const catchAsync = require('../utils/catchAsync');
const recommendationService = require('../services/recommendationService');

exports.getPersonalizedRecommendations = catchAsync(async (req, res) => {
  const recommendations = await recommendationService.getPersonalizedRecommendations(req.user.id);
  res.status(200).json({
    status: 'success',
    data: recommendations
  });
});

exports.getSimilarMovies = catchAsync(async (req, res) => {
  const similarMovies = await recommendationService.getSimilarMovies(req.params.movieId);
  res.status(200).json({
    status: 'success',
    data: similarMovies
  });
});

exports.getTrendingMovies = catchAsync(async (req, res) => {
  const trendingMovies = await recommendationService.getTrendingMovies();
  res.status(200).json({
    status: 'success',
    data: trendingMovies
  });
});

exports.getTopRatedMovies = catchAsync(async (req, res) => {
  const topRatedMovies = await recommendationService.getTopRatedMovies();
  res.status(200).json({
    status: 'success',
    data: topRatedMovies
  });
});
