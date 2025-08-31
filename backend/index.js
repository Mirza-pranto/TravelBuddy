// backend/index.js - Updated to include admin routes
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/profile-pics');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and original extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// File upload route for profile pictures
app.post('/api/auth/upload-profile-pic', upload.single('profilePic'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return the file path that can be accessed via the static route
        const filePath = `/uploads/profile-pics/${req.file.filename}`;
        res.json({ 
            success: true, 
            filePath: filePath,
            message: 'File uploaded successfully' 
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Configure multer for note image uploads
const noteImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads/note-images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadNoteImages = multer({
    storage: noteImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter // Reuse the same filter from profile pics
});

// Route for uploading note images
app.post('/api/notes/upload-images', uploadNoteImages.array('noteImages', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const filePaths = req.files.map(file => `/uploads/note-images/${file.filename}`);
        res.json({ 
            success: true, 
            filePaths,
            message: 'Files uploaded successfully' 
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    if (error.message === 'Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

// Available routes - MAKE SURE ADMIN ROUTES ARE ADDED HERE
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/tour-requests', require('./routes/tourRequests'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/admin', require('./routes/admin')); // Add this line for admin routes

app.use('/api/reports', require('./routes/reports'));
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`TravelBuddy backend listening on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});