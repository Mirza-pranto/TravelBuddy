const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentsSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comments', CommentsSchema);