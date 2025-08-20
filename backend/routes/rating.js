const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const User = require('../models/User');
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// Route 1: Add/Update a rating: POST "/api/ratings/rate" . Login required
router.post('/rate', fetchuser, [
    body('reviewee', 'Reviewee ID is required').notEmpty(),
    body('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    body('review', 'Review must be between 10 and 500 characters').isLength({ min: 10, max: 500 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { reviewee, rating, review, tourRelated } = req.body;
        const reviewer = req.user.id;

        // Prevent self-rating
        if (reviewer === reviewee) {
            return res.status(400).json({ 
                success: false, 
                error: 'You cannot rate yourself' 
            });
        }

        // Check if reviewee exists
        const revieweeUser = await User.findById(reviewee);
        if (!revieweeUser) {
            return res.status(404).json({ 
                success: false, 
                error: 'User to be rated not found' 
            });
        }

        // Check if rating already exists
        let existingRating = await Rating.findOne({ reviewer, reviewee });

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.review = review;
            if (tourRelated) existingRating.tourRelated = tourRelated;
            existingRating.date = new Date();
            
            await existingRating.save();
            await updateUserRatingStats(reviewee);
            
            return res.json({ 
                success: true, 
                message: 'Rating updated successfully',
                rating: existingRating 
            });
        } else {
            // Create new rating
            const newRating = new Rating({
                reviewer,
                reviewee,
                rating,
                review,
                tourRelated: tourRelated || null
            });

            await newRating.save();
            await updateUserRatingStats(reviewee);

            return res.json({ 
                success: true, 
                message: 'Rating added successfully',
                rating: newRating 
            });
        }

    } catch (error) {
        console.error('Error adding/updating rating:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route 2: Get ratings for a user: GET "/api/ratings/user/:userId"
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const ratings = await Rating.find({ 
            reviewee: userId, 
            isVisible: true 
        })
        .populate('reviewer', 'name profilePic')
        .populate('tourRelated', 'title destination')
        .sort({ date: -1 });

        res.json(ratings);
    } catch (error) {
        console.error('Error fetching user ratings:', error);
        res.status(500).send("Internal Server Error");
    }
});

// Route 3: Get rating given by logged-in user to another user: GET "/api/ratings/my-rating/:userId"
router.get('/my-rating/:userId', fetchuser, async (req, res) => {
    try {
        const reviewee = req.params.userId;
        const reviewer = req.user.id;

        const rating = await Rating.findOne({ reviewer, reviewee })
            .populate('reviewee', 'name profilePic');

        if (!rating) {
            return res.json({ hasRated: false });
        }

        res.json({ 
            hasRated: true, 
            rating: rating 
        });
    } catch (error) {
        console.error('Error fetching user rating:', error);
        res.status(500).send("Internal Server Error");
    }
});

// Route 4: Delete a rating: DELETE "/api/ratings/:ratingId"
router.delete('/:ratingId', fetchuser, async (req, res) => {
    try {
        const ratingId = req.params.ratingId;
        const userId = req.user.id;

        const rating = await Rating.findById(ratingId);
        
        if (!rating) {
            return res.status(404).json({ 
                success: false, 
                error: 'Rating not found' 
            });
        }

        // Only allow deletion by the reviewer
        if (rating.reviewer.toString() !== userId) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized to delete this rating' 
            });
        }

        const revieweeId = rating.reviewee;
        await Rating.findByIdAndDelete(ratingId);
        await updateUserRatingStats(revieweeId);

        res.json({ 
            success: true, 
            message: 'Rating deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route 5: Get rating statistics for a user: GET "/api/ratings/stats/:userId"
router.get('/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const ratings = await Rating.find({ 
            reviewee: userId, 
            isVisible: true 
        });

        const stats = {
            totalRatings: ratings.length,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };

        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            stats.averageRating = (sum / ratings.length).toFixed(1);

            // Count distribution
            ratings.forEach(rating => {
                stats.ratingDistribution[rating.rating]++;
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching rating stats:', error);
        res.status(500).send("Internal Server Error");
    }
});

// Helper function to update user rating statistics
async function updateUserRatingStats(userId) {
    try {
        const ratings = await Rating.find({ 
            reviewee: userId, 
            isVisible: true 
        });

        let averageRating = 0;
        const totalRatings = ratings.length;

        if (totalRatings > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            averageRating = sum / totalRatings;
        }

        await User.findByIdAndUpdate(userId, {
            averageRating: averageRating,
            totalRatings: totalRatings
        });

    } catch (error) {
        console.error('Error updating user rating stats:', error);
    }
}

module.exports = router;