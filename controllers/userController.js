const User = require('../models/User');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  const token = user.generateToken();
  res.status(201).json({ token, user });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = user.generateToken();
  res.json({ token, user });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { favoriteGenres, favoriteActors } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { favoriteGenres, favoriteActors },
    { new: true, runValidators: true }
  );
  res.json({ user });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { movieId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { wishlist: movieId } },
    { new: true }
  );
  res.json({ user });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { movieId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: movieId } },
    { new: true }
  );
  res.json({ user });
});
