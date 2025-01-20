const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  }
});

reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update movie's average rating when a review is created/updated
reviewSchema.post('save', async function() {
  await this.model('Movie').findByIdAndUpdate(this.movie, {
    $inc: { 'ratings.count': 1 },
    $set: { 'ratings.average': await this.model('Review')
      .aggregate([
        { $match: { movie: this.movie } },
        { $group: { _id: '$movie', averageRating: { $avg: '$rating' } } }
      ])
      .then(result => result[0]?.averageRating || 0)
    }
  });
});

reviewSchema.methods.updateHelpfulness = async function(helpful) {
  if (helpful) {
    this.helpful += 1;
  } else {
    this.unhelpful += 1;
  }
  await this.save();
};

module.exports = mongoose.model('Review', reviewSchema);