const mongoose = require('mongoose');
const { Schema } = mongoose;




const CommentSchema = new Schema({
    tour: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour', 
        required: true 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Comment', CommentSchema);