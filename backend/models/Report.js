const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['Spam', 'Harassment', 'Inappropriate Content', 'Fake Profile', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    evidence: [{
        type: String // URLs to evidence images
    }],
    adminNotes: {
        type: String,
        maxlength: 1000
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    resolvedAt: {
        type: Date
    }
}, { timestamps: true });

// Index for efficient queries
ReportSchema.index({ reporter: 1, reportedUser: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('report', ReportSchema);