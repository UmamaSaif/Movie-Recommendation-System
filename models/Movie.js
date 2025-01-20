const mongoose = require('mongoose');

const crewMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  biography: String,
  birthDate: Date,
  awards: [{
    name: String,
    year: Number,
    category: String
  }],
  photos: [String], // URLs to photos
  filmography: [{
    title: String,
    year: Number,
    role: String
  }]
});

const triviaSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const goofSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Continuity', 'Factual', 'Plot', 'Technical', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  timestamp: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const soundtrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: String,
  composer: String,
  duration: String,
  scene: String
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  originalTitle: String,
  genres: [{
    type: String,
    required: true
  }],
  director: crewMemberSchema,
  cast: [crewMemberSchema],
  crew: [crewMemberSchema],
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number, // in minutes
    required: true
  },
  synopsis: {
    type: String,
    required: true
  },
  tagline: String,
  coverPhoto: {
    type: String,
    required: true
  },
  photos: [String], // additional movie photos/stills
  trailers: [{
    url: String,
    type: String, // 'Teaser', 'Official', 'Behind the Scenes'
    language: String
  }],
  ageRating: {
    rating: {
      type: String,
      required: true,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
    },
    reasons: [{
      type: String,
      enum: ['Violence', 'Language', 'Nudity', 'Drug Use', 'Thematic Elements', 'Sexual Content']
    }],
    description: String // Detailed explanation of rating
  },
  trivia: [triviaSchema],
  goofs: [goofSchema],
  soundtrack: [soundtrackSchema],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Released', 'In Production'],
    required: true
  },
  language: {
    original: String,
    available: [String]
  },
  budget: Number,
  boxOffice: Number,
  keywords: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate reviews
movieSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'movie',
  localField: '_id'
});

// Update average rating when reviews change
movieSchema.methods.updateAverageRating = async function() {
  const stats = await mongoose.model('Review').aggregate([
    {
      $match: { movie: this._id }
    },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  await this.model('Movie').findByIdAndUpdate(this._id, {
    'ratings.average': stats[0]?.averageRating || 0,
    'ratings.count': stats[0]?.count || 0
  });
};

module.exports = mongoose.model('Movie', movieSchema);