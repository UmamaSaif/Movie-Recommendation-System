// src/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('./config/database'); // Ensure database connection
const userRoutes = require('./routes/userRoutes'); // Import user routes
const adminRoutes = require('./routes/adminRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const listRoutes = require('./routes/listRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const newsRoutes = require('./routes/newsRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const boxOfficeRoutes = require('./routes/boxOfficeRoutes');
const awardRoutes = require('./routes/awardRoutes');
//const errorHandler = require('./middleware/errorHandler'); // Import error handler middleware

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON requests

app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return express.json()(req, res, next);
    }
    next();
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // Set up user routes
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/box-office', boxOfficeRoutes);
app.use('/api/awards', awardRoutes);

// Error handling
//app.use(errorHandler); // Global error handler middleware

module.exports = app;
