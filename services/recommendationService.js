const Movie = require('../models/Movie');
const User = require('../models/User');
const Review = require('../models/Review');

class RecommendationService {
  // Calculate similarity between users based on ratings
  async calculateUserSimilarity(user1Id, user2Id) {
    const user1Reviews = await Review.find({ user: user1Id });
    const user2Reviews = await Review.find({ user: user2Id });
    
    const commonMovies = user1Reviews.filter(review1 => 
      user2Reviews.some(review2 => 
        review2.movie.toString() === review1.movie.toString()
      )
    );
    
    if (commonMovies.length === 0) return 0;
    
    let similarityScore = 0;
    commonMovies.forEach(movie1 => {
      const movie2 = user2Reviews.find(review => 
        review.movie.toString() === movie1.movie.toString()
      );
      similarityScore += Math.abs(5 - Math.abs(movie1.rating - movie2.rating)) / 5;
    });
    
    return similarityScore / commonMovies.length;
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId, limit = 10) {
    const user = await User.findById(userId);
    const allUsers = await User.find({ _id: { $ne: userId } });
    
    // Calculate similarity with all other users
    const userSimilarities = await Promise.all(
      allUsers.map(async otherUser => ({
        userId: otherUser._id,
        similarity: await this.calculateUserSimilarity(userId, otherUser._id)
      }))
    );
    
    // Sort by similarity and get top similar users
    const similarUsers = userSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    // Get movies rated highly by similar users
    const recommendedMovies = await Review.aggregate([
      {
        $match: {
          user: { $in: similarUsers.map(u => u.userId) },
          rating: { $gte: 4 }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $match: {
          'movieDetails.genre': { $in: user.preferredGenres }
        }
      },
      {
        $group: {
          _id: '$movie',
          score: { $sum: 1 },
          movieDetails: { $first: '$movieDetails' }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ]);
    
    return recommendedMovies.map(item => item.movieDetails);
  }

  // Get similar movies
  async getSimilarMovies(movieId, limit = 6) {
    const movie = await Movie.findById(movieId);
    
    return Movie.aggregate([
      {
        $match: {
          _id: { $ne: movie._id },
          $or: [
            { genre: { $in: movie.genre } },
            { director: movie.director }
          ]
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          similarityScore: {
            $sum: [
              { $cond: [{ $in: [movie.director, '$director'] }, 2, 0] },
              { 
                $size: {
                  $setIntersection: [movie.genre, '$genre']
                }
              }
            ]
          }
        }
      },
      { $sort: { similarityScore: -1, averageRating: -1 } },
      { $limit: limit }
    ]);
  }

  // Get trending movies
  async getTrendingMovies(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    return Movie.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'recentReviews'
        }
      },
      {
        $addFields: {
          recentReviews: {
            $filter: {
              input: '$recentReviews',
              as: 'review',
              cond: { $gte: ['$$review.createdAt', dateThreshold] }
            }
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $size: '$recentReviews' },
              { $avg: '$recentReviews.rating' }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit }
    ]);
  }

  // Get top rated movies
  async getTopRatedMovies(limit = 10, minReviews = 5) {
    return Movie.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          numberOfReviews: { $size: '$reviews' },
          averageRating: { $avg: '$reviews.rating' }
        }
      },
      {
        $match: {
          numberOfReviews: { $gte: minReviews }
        }
      },
      { $sort: { averageRating: -1 } },
      { $limit: limit }
    ]);
  }
}

module.exports = new RecommendationService();