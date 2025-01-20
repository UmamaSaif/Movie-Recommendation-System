const News = require('../models/News');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllNews = catchAsync(async (req, res) => {
  const features = new APIFeatures(News.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const news = await features.query.populate('author', 'name');

  res.status(200).json({
    status: 'success',
    results: news.length,
    data: news
  });
});

exports.getNews = catchAsync(async (req, res) => {
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name');

  if (!news) {
    return res.status(404).json({
      status: 'fail',
      message: 'No news found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: news
  });
});

exports.createNews = catchAsync(async (req, res) => {
  const news = await News.create({
    ...req.body,
    author: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: news
  });
});

exports.updateNews = catchAsync(async (req, res) => {
  const news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!news) {
    return res.status(404).json({
      status: 'fail',
      message: 'No news found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: news
  });
});

exports.deleteNews = catchAsync(async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);

  if (!news) {
    return res.status(404).json({
      status: 'fail',
      message: 'No news found with that ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});