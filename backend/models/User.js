// models/User.js - Updated with virtual field
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    nidNumber: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    phoneNumber: { 
        type: String, 
        unique: true, 
        sparse: true,
        trim: true
    },
    bio: { 
        type: String, 
        default: '',
        maxLength: 500 
    },
    profilePic: { 
        type: String, 
        default: '' 
    },
    pastTours: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tour' 
    }],
    averageRating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5 
    },
    totalRatings: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    }
});



module.exports = mongoose.model('user', UserSchema);