const Award = require('../models/Award');
const catchAsync = require('../utils/catchAsync');

exports.createAward = catchAsync(async (req, res) => {
  const award = await Award.create(req.body);

  res.status(201).json({
    status: 'success',
    data: award
  });
});

exports.getMovieAwards = catchAsync(async (req, res) => {
  const awards = await Award.find({ movie: req.params.movieId })
    .sort({ year: -1 });

  res.status(200).json({
    status: 'success',
    results: awards.length,
    data: awards
  });
});

exports.getAwardsByYear = catchAsync(async (req, res) => {
  const awards = await Award.find({ year: req.params.year })
    .populate('movie', 'title');

  res.status(200).json({
    status: 'success',
    results: awards.length,
    data: awards
  });
});

exports.updateAward = catchAsync(async (req, res) => {
  const award = await Award.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!award) {
    return res.status(404).json({
      status: 'fail',
      message: 'No award found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: award
  });
});
