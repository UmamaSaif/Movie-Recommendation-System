const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  person: {
    name: String,
    role: String
  },
  type: {
    type: String,
    enum: ['nomination', 'winner'],
    required: true
  }
});

module.exports = mongoose.model('Award', awardSchema);