const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/Review');

exports.getAllMovies = catchAsync(async (req, res) => {
  const features = new APIFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const movies = await features.query;

  res.json({
    status: 'success',
    results: movies.length,
    data: { movies }
  });
});

exports.getMovie = catchAsync(async (req, res) => {
  const movie = await Movie.findById(req.params.id)
    .populate('reviews')
    .populate('trivia.addedBy', 'name')
    .populate('goofs.addedBy', 'name');

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  res.json({
    status: 'success',
    data: { movie }
  });
});

exports.createMovie = catchAsync(async (req, res) => {
  // Restricted to admin only (handled by middleware)
  const movie = await Movie.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { movie }
  });
});

exports.updateMovie = catchAsync(async (req, res) => {
  // Restricted to admin only (handled by middleware)
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  res.json({
    status: 'success',
    data: { movie }
  });
});

exports.deleteMovie = catchAsync(async (req, res) => {
  // Restricted to admin only (handled by middleware)
  const movie = await Movie.findByIdAndDelete(req.params.id);

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.addTrivia = catchAsync(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  movie.trivia.push({
    content: req.body.content,
    addedBy: req.user._id
  });

  await movie.save();

  res.status(201).json({
    status: 'success',
    data: { movie }
  });
});

exports.addGoof = catchAsync(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  movie.goofs.push({
    category: req.body.category,
    description: req.body.description,
    timestamp: req.body.timestamp,
    addedBy: req.user._id
  });

  await movie.save();

  res.status(201).json({
    status: 'success',
    data: { movie }
  });
});

exports.addSoundtrack = catchAsync(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }

  movie.soundtrack.push(req.body);
  await movie.save();

  res.status(201).json({
    status: 'success',
    data: { movie }
  });
});

exports.searchMovies = catchAsync(async (req, res) => {
  const features = new APIFeatures(Movie.find(), req.query)
    .filter()
    .search(['title', 'director', 'cast']);

  const movies = await features.query;

  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: movies
  });
});

exports.filterMovies = catchAsync(async (req, res) => {
  const features = new APIFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const movies = await features.query;
  const totalMovies = await Movie.countDocuments();

  res.status(200).json({
    status: 'success',
    page: features.page,
    limit: features.limit,
    totalResults: totalMovies,
    results: movies.length,
    data: movies
  });
});

exports.getTopMovies = catchAsync(async (req, res) => {
  const { period = 'month', genre } = req.query;
  const topMovies = await this.getTopMoviesByPeriod(period, genre);

  res.status(200).json({
    status: 'success',
    data: topMovies
  });
});

exports.getTopMoviesByPeriod = async (period, genre) => {
  const dateThreshold = new Date();
  switch (period) {
    case 'month':
      dateThreshold.setMonth(dateThreshold.getMonth() - 1);
      break;
    case 'year':
      dateThreshold.setFullYear(dateThreshold.getFullYear() - 1);
      break;
    default:
      dateThreshold.setDate(dateThreshold.getDate() - 7);
  }

  const pipeline = [
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movie',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        numReviews: { $size: '$reviews' }
      }
    },
    {
      $match: {
        'reviews.createdAt': { $gte: dateThreshold }
      }
    },
    {
      $sort: {
        averageRating: -1,
        numReviews: -1
      }
    },
    {
      $limit: 10
    }
  ];

  if (genre) {
    pipeline.unshift({
      $match: {
        genre: { $in: [genre] }
      }
    });
  }

  return Movie.aggregate(pipeline);
};