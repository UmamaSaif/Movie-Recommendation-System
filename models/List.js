// src/models/List.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A list must have a title'],
    trim: true,
    maxlength: [100, 'List title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'List description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A list must belong to a user']
  },
  movies: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Movie'
  }],
  category: {
    type: String,
    enum: ['Watchlist', 'Custom', 'Genre-based', 'Collection'],
    default: 'Custom'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  totalViews: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
listSchema.index({ creator: 1, title: 1 });
listSchema.index({ followers: 1 });
listSchema.index({ isPublic: 1 });

// Virtual field for number of movies in the list
listSchema.virtual('movieCount').get(function() {
  return this.movies.length;
});

// Virtual field for number of followers
listSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Middleware to populate creator and movies when finding lists
listSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'creator',
    select: 'name username avatar'
  }).populate({
    path: 'movies',
    select: 'title posterUrl releaseYear genre averageRating'
  });
  
  next();
});

// Update lastUpdated timestamp when list is modified
listSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Instance method to check if a user is following this list
listSchema.methods.isFollowedBy = function(userId) {
  return this.followers.some(followerId => 
    followerId.toString() === userId.toString()
  );
};

// Instance method to add a movie to the list
listSchema.methods.addMovie = function(movieId) {
  if (!this.movies.includes(movieId)) {
    this.movies.push(movieId);
    this.lastUpdated = Date.now();
  }
  return this.save();
};

// Instance method to remove a movie from the list
listSchema.methods.removeMovie = function(movieId) {
  this.movies = this.movies.filter(id => 
    id.toString() !== movieId.toString()
  );
  this.lastUpdated = Date.now();
  return this.save();
};

// Static method to get popular lists
listSchema.statics.getPopularLists = function(limit = 10) {
  return this.aggregate([
    {
      $match: { isPublic: true }
    },
    {
      $addFields: {
        popularityScore: {
          $add: [
            { $size: '$followers' },
            { $multiply: [{ $size: '$movies' }, 0.5] },
            { $divide: ['$totalViews', 100] }
          ]
        }
      }
    },
    {
      $sort: { popularityScore: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get lists by genre
listSchema.statics.getListsByGenre = function(genre) {
  return this.find({
    isPublic: true,
    $or: [
      { category: 'Genre-based' },
      { tags: genre }
    ]
  }).sort('-followerCount');
};

const List = mongoose.model('List', listSchema);

module.exports = List;