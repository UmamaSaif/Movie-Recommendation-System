const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  trailerDate: Date,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notificationType: [{
    type: String,
    enum: ['email', 'dashboard'],
    default: ['dashboard']
  }]
}, { timestamps: true });

module.exports = mongoose.model('Release', releaseSchema);