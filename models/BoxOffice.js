const mongoose = require('mongoose');

const boxOfficeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  openingWeekend: {
    domestic: Number,
    international: Number
  },
  totalEarnings: {
    domestic: Number,
    international: Number
  },
  budget: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BoxOffice', boxOfficeSchema);
