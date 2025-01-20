const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res) => {
  const { movie, rating, title, content } = req.body;
  const review = await Review.create({
    movie,
    user: req.user._id,
    rating,
    title,
    content
  });
  res.status(201).json({ status: 'success', data: { review } });
});

exports.updateReview = catchAsync(async (req, res) => {
  const { rating, title, content } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, title, content, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }

  res.json({ status: 'success', data: { review } });
});

exports.markHelpful = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }
  await review.updateHelpfulness(true);
  res.json({ status: 'success', data: { review } });
});

exports.markUnhelpful = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }
  await review.updateHelpfulness(false);
  res.json({ status: 'success', data: { review } });
});

exports.getReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId })
    .populate('user', 'name')
    .sort({ helpful: -1, createdAt: -1 });

  res.json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.getTopReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId, status: 'Approved' })
    .populate('user', 'name')
    .sort({ helpful: -1, rating: -1 })
    .limit(3);

  res.json({ status: 'success', results: reviews.length, data: { reviews } });
});