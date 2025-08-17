const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    destination: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    travelType: {
        type: String,
        enum: ['Adventure', 'Relax', 'Cultural', 'Backpacking', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        required: true,
        minlength: 5
    },
    tag: {
        type: String,
        default: "General"
    },
    aiPlanned: { 
        type: Boolean,
        default: false
    },
    images: [{
        type: String,
        default: []
    }],
    featuredImage: {
        type: String,
        default: ''
    },
    // New fields for tour requests and mates
    joinRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date
        }
    }],
    tourMates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    maxTourMates: {
        type: Number,
        default: 10,
        min: 1
    }
}, { timestamps: true });

// Index for efficient queries
NotesSchema.index({ 'joinRequests.user': 1, 'joinRequests.status': 1 });
NotesSchema.index({ 'tourMates': 1 });

module.exports = mongoose.model('notes', NotesSchema);