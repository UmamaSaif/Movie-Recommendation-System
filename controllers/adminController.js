const Movie = require('../models/Movie');
const User = require('../models/User');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Movie Management
exports.addMovie = catchAsync(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { movie }
  });
});

exports.updateMovie = catchAsync(async (req, res) => {
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
  const movie = await Movie.findByIdAndDelete(req.params.id);
  
  if (!movie) {
    throw new AppError('No movie found with that ID', 404);
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Review Moderation
exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name')
    .populate('movie', 'title');
    
  res.json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

exports.moderateReview = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }, // status can be 'approved' or 'rejected'
    { new: true }
  );
  
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }
  
  res.json({
    status: 'success',
    data: { review }
  });
});

// Site Statistics
exports.getSiteStatistics = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalMovies,
    totalReviews,
    activeUsers,
    popularMovies,
    topGenres
  ] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Review.countDocuments(),
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    Movie.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'reviews'
        }
      },
      {
        $project: {
          title: 1,
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { reviewCount: -1, averageRating: -1 } },
      { $limit: 10 }
    ]),
    Movie.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
  ]);

  res.json({
    status: 'success',
    data: {
      totalUsers,
      totalMovies,
      totalReviews,
      activeUsers,
      popularMovies,
      topGenres
    }
  });
});

exports.getUserEngagementMetrics = catchAsync(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const userMetrics = await User.aggregate([
    {
      $facet: {
        activityByDay: [
          {
            $match: {
              lastActive: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActive' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ],
        topSearchedActors: [
          { $unwind: '$favoriteActors' },
          {
            $group: {
              _id: '$favoriteActors',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        genrePreferences: [
          { $unwind: '$favoriteGenres' },
          {
            $group: {
              _id: '$favoriteGenres',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]
      }
    }
  ]);

  res.json({
    status: 'success',
    data: userMetrics[0]
  });
});