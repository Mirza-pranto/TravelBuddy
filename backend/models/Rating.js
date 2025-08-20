const mongoose = require('mongoose');
const { Schema } = mongoose;

const RatingSchema = new Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 500
    },
    tourRelated: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes', // Reference to the tour/note this rating is related to
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
    isVisible: {
        type: Boolean,
        default: true
    }
});

// Prevent users from rating themselves
RatingSchema.pre('save', function(next) {
    if (this.reviewer.toString() === this.reviewee.toString()) {
        const error = new Error('Users cannot rate themselves');
        return next(error);
    }
    next();
});

// Ensure one rating per reviewer-reviewee pair (users can update their existing rating)
RatingSchema.index({ reviewer: 1, reviewee: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);