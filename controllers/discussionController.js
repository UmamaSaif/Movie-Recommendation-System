const Discussion = require('../models/Discussion');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllDiscussions = catchAsync(async (req, res) => {
  const features = new APIFeatures(Discussion.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const discussions = await features.query
    .populate('author', 'name')
    .populate('relatedMovie', 'title');

  res.status(200).json({
    status: 'success',
    results: discussions.length,
    data: discussions
  });
});

exports.getDiscussion = catchAsync(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id)
    .populate('author', 'name')
    .populate('replies.author', 'name')
    .populate('relatedMovie', 'title');

  if (!discussion) {
    return res.status(404).json({
      status: 'fail',
      message: 'No discussion found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: discussion
  });
});

exports.createDiscussion = catchAsync(async (req, res) => {
  const discussion = await Discussion.create({
    ...req.body,
    author: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: discussion
  });
});

exports.addReply = catchAsync(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return res.status(404).json({
      status: 'fail',
      message: 'No discussion found with that ID'
    });
  }

  if (discussion.isLocked) {
    return res.status(403).json({
      status: 'fail',
      message: 'This discussion is locked'
    });
  }

  discussion.replies.push({
    content: req.body.content,
    author: req.user._id
  });

  await discussion.save();

  res.status(200).json({
    status: 'success',
    data: discussion
  });
});

exports.updateDiscussion = catchAsync(async (req, res) => {
  const discussion = await Discussion.findOneAndUpdate(
    {
      _id: req.params.id,
      author: req.user._id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!discussion) {
    return res.status(404).json({
      status: 'fail',
      message: 'No discussion found with that ID or you are not the author'
    });
  }

  res.status(200).json({
    status: 'success',
    data: discussion
  });
});

exports.deleteDiscussion = catchAsync(async (req, res) => {
  const discussion = await Discussion.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id
  });

  if (!discussion) {
    return res.status(404).json({
      status: 'fail',
      message: 'No discussion found with that ID or you are not the author'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});