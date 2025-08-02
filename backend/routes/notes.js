const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

//Route 1: Get all the notes: GET "/api/notes/fetchallnotes" . Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});

//Route 2: Add a new note: POST "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('destination', 'Destination is required').notEmpty(),
    body('startDate', 'Start date is required').isISO8601(),
    body('endDate', 'End date is required').isISO8601(),
    body('budget', 'Budget must be a number').isNumeric(),
    body('travelType', 'Invalid travel type').isIn(['Adventure', 'Relax', 'Cultural', 'Backpacking', 'Other']),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => { 
    try {
        const { title, destination, startDate, endDate, budget, travelType, description, tag } = req.body;

        // Validate errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title,
            destination,
            startDate,
            endDate,
            budget,
            travelType,
            description,
            tag,
            user: req.user.id
        });

        const savedNote = await note.save();
        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});
//Route 3: Update an existing note: PUT "/api/notes/updatenote/:id" . Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, destination, startDate, endDate, budget, travelType, description, tag } = req.body;

    // Create a newNote object
    const newNote = {};
    if (title) newNote.title = title;
    if (destination) newNote.destination = destination;
    if (startDate) newNote.startDate = startDate;
    if (endDate) newNote.endDate = endDate;
    if (budget) newNote.budget = budget;
    if (travelType) newNote.travelType = travelType;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    try {
        // Find the note to be updated
        let note = await Notes.findById(req.params.id);
        if (!note) return res.status(404).send("Not Found");

        // Allow update only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Update the note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});



//Route 4: Delete an existing note: DELETE "/api/notes/deletenote/:id" . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted
        let note = await Notes.findById(req.params.id);
        if (!note) return res.status(404).send("Not Found");

        // Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Delete the note
        await Notes.findByIdAndDelete(req.params.id);

        res.json({ success: "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 5: Get all notes from all users: GET "/api/notes/newsfeed" . Public or admin use
router.get('/newsfeed', async (req, res) => {
    try {
        const notes = await Notes.find().sort({ createdAt: -1 }); // newest first
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
