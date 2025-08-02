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
    }
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('notes', NotesSchema);
