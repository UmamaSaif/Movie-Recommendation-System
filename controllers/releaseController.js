const Release = require('../models/Release');
const catchAsync = require('../utils/catchAsync');
const emailService = require('../services/emailService');

exports.createRelease = catchAsync(async (req, res) => {
  const release = await Release.create(req.body);
  res.status(201).json({ status: 'success', data: release });
});

exports.subscribeToRelease = catchAsync(async (req, res) => {
  const release = await Release.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { subscribers: req.user._id } },
    { new: true }
  );
  res.status(200).json({ status: 'success', data: release });
});

exports.checkUpcomingReleases = catchAsync(async () => {
  const upcoming = await Release.find({
    releaseDate: { 
      $gte: new Date(),
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }).populate('subscribers');

  for (const release of upcoming) {
    for (const subscriber of release.subscribers) {
      if (release.notificationType.includes('email')) {
        await emailService.sendReleaseNotification(subscriber.email, release);
      }
    }
  }
});

exports.getUpcoming = catchAsync(async (req, res) => {
  const upcomingReleases = await Release.find({
    releaseDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(200).json({
    status: 'success',
    results: upcomingReleases.length,
    data: upcomingReleases,
  });
});


