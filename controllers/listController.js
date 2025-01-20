const List = require('../models/List');
const catchAsync = require('../utils/catchAsync');

exports.createList = catchAsync(async (req, res) => {
  const newList = await List.create({
    ...req.body,
    creator: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: newList
  });
});

exports.updateList = catchAsync(async (req, res) => {
  const list = await List.findOneAndUpdate(
    { _id: req.params.id, creator: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!list) {
    return res.status(404).json({
      status: 'fail',
      message: 'List not found or you are not the creator'
    });
  }

  res.status(200).json({
    status: 'success',
    data: list
  });
});

exports.deleteList = catchAsync(async (req, res) => {
  const list = await List.findOneAndDelete({
    _id: req.params.id,
    creator: req.user.id
  });

  if (!list) {
    return res.status(404).json({
      status: 'fail',
      message: 'List not found or you are not the creator'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.followList = catchAsync(async (req, res) => {
  const list = await List.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { followers: req.user.id } },
    { new: true }
  );

  if (!list) {
    return res.status(404).json({
      status: 'fail',
      message: 'List not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: list
  });
});

exports.unfollowList = catchAsync(async (req, res) => {
  const list = await List.findByIdAndUpdate(
    req.params.id,
    { $pull: { followers: req.user.id } },
    { new: true }
  );

  if (!list) {
    return res.status(404).json({
      status: 'fail',
      message: 'List not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: list
  });
});

exports.getUserLists = catchAsync(async (req, res) => {
  const lists = await List.find({ creator: req.params.userId });
  res.status(200).json({
    status: 'success',
    data: lists
  });
});

exports.getFollowedLists = catchAsync(async (req, res) => {
  const lists = await List.find({ followers: req.user.id });
  res.status(200).json({
    status: 'success',
    data: lists
  });
});