const express = require('express');
const router = express.Router();
const Joinrequests = require('../models/Joinrequests');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// Route 1: Get all joinrequests for a specific note: GET "/api/joinrequests/fetchalljoinrequest/:noteId" - Login required
router.get('/fetchalljoinrequest/:noteId', fetchuser, async (req, res) => {
    try {
        const noteId = req.params.noteId;

        if (!noteId) {
            return res.status(400).json({ error: "Note ID is required in URL." });
        }

        const joinrequests = await Joinrequests.find({ note: noteId }).sort({ createdAt: -1 });
        res.json(joinrequests);
    } catch (error) {
        console.error("Error fetching joinrequests:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Add a new joinrequest: POST "/api/joinrequests/addjoinrequest/:noteId" - Login required
router.post('/addjoinrequest/:noteId', fetchuser, [
    body('text', 'Joinrequest text is required').notEmpty()
], async (req, res) => {
    try {
        console.log('=== DEBUG: Starting addjoinrequest route ===');
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

        console.log('Creating joinrequest with:', { text, noteId, userId: req.user.id });

        // Validate ObjectId format if using MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            console.log('Invalid noteId format:', noteId);
            return res.status(400).json({ error: "Invalid note ID format" });
        }

        const joinrequest = new Joinrequests({
            
            note: noteId,
            requester: req.user.id,
            status,
            message: text,
             
        });

        console.log('Joinrequest object created:', joinrequest);

        const savedComment = await joinrequest.save();
        console.log('Joinrequest saved successfully:', savedComment);
        
        res.json(savedComment);
    } catch (error) {
        console.error("=== ERROR in addcomment route ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Delete joinrequest
router.delete('/deletecomment/:id', fetchuser, async (req, res) => {
    try {
        const joinrequest = await Joinrequests.findById(req.params.id);
        if (!joinrequest) {
            return res.status(404).json({ error: "Joinrequest not found" });
        }
        
        // Check if user owns this joinrequest
        if (joinrequest.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized" });
        }
        
        await Joinrequests.findByIdAndDelete(req.params.id);
        res.json({ success: "Joinrequest deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Update joinrequest
router.put('/updatecomment/:id', fetchuser, [
    body('text', 'Joinrequest text is required').notEmpty()
], async (req, res) => {
    try {
        const { text } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const joinrequest = await Joinrequests.findById(req.params.id);
        if (!joinrequest) {
            return res.status(404).json({ error: "Joinrequest not found" });
        }
        
        // Check if user owns this joinrequest
        if (joinrequest.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized" });
        }
        
        const updatedComment = await Joinrequests.findByIdAndUpdate(
            req.params.id,
            { text },
            { new: true }
        );
        
        res.json(updatedComment);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
