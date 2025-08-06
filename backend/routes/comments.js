const express = require('express');
const router = express.Router();
const Comments = require('../models/Comments');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// Route 1: Get all comments for a specific note: GET "/api/comments/fetchallcomment/:noteId" - Login required
router.get('/fetchallcomment/:noteId', fetchuser, async (req, res) => {
    try {
        const noteId = req.params.noteId;

        if (!noteId) {
            return res.status(400).json({ error: "Note ID is required in URL." });
        }

        const comments = await Comments.find({ note: noteId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Add a new comment: POST "/api/comments/addcomment/:noteId" - Login required
router.post('/addcomment/:noteId', fetchuser, [
    body('text', 'Comment text is required').notEmpty()
], async (req, res) => {
    try {
        console.log('=== DEBUG: Starting addcomment route ===');
        console.log('req.params:', req.params);
        console.log('req.body:', req.body);
        console.log('req.user:', req.user);

        const noteId = req.params.noteId;
        const { text } = req.body;

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('Creating comment with:', { text, noteId, userId: req.user.id });

        // Validate ObjectId format if using MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            console.log('Invalid noteId format:', noteId);
            return res.status(400).json({ error: "Invalid note ID format" });
        }

        const comment = new Comments({
            text,
            note: noteId,
            user: req.user.id
        });

        console.log('Comment object created:', comment);

        const savedComment = await comment.save();
        console.log('Comment saved successfully:', savedComment);
        
        res.json(savedComment);
    } catch (error) {
        console.error("=== ERROR in addcomment route ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
module.exports = router;
