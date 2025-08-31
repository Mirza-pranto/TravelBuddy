const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const mongoose = require('mongoose');

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: "Access denied. Admin privileges required." 
            });
        }
        next();
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
};

// Route 1: Get admin dashboard statistics
router.get('/dashboard-stats', fetchuser, checkAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Notes.countDocuments();
        const totalAdmins = await User.countDocuments({ isAdmin: true });
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentUsers = await User.countDocuments({ 
            date: { $gte: sevenDaysAgo } 
        });
        const recentPosts = await Notes.countDocuments({ 
            createdAt: { $gte: sevenDaysAgo } 
        });

        // Posts by travel type
        const postsByTravelType = await Notes.aggregate([
            { $group: { _id: "$travelType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalPosts,
                totalAdmins,
                recentUsers,
                recentPosts,
                postsByTravelType
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// routes/admin.js - Updated to populate postsCount
// Route 2: Get all users with pagination and search - Updated to include postsCount
router.get('/users', fetchuser, checkAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { nidNumber: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(searchQuery)
            .select('-password')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('postsCount'); // Populate the virtual field

        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 3: Get all posts with pagination and search
router.get('/posts', fetchuser, checkAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { destination: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const posts = await Notes.find(searchQuery)
            .populate('user', 'name email profilePic')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Notes.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 4: Delete a user account
router.delete('/users/:userId', fetchuser, checkAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid user ID format" 
            });
        }

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                error: "You cannot delete your own account" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        // Delete all posts by this user
        await Notes.deleteMany({ user: userId });

        // Remove user from all tour requests and tour mates
        await Notes.updateMany(
            { 'joinRequests.user': userId },
            { $pull: { joinRequests: { user: userId } } }
        );

        await Notes.updateMany(
            { tourMates: userId },
            { $pull: { tourMates: userId } }
        );

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: `User ${user.name} and all associated data have been deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 5: Delete a post
router.delete('/posts/:postId', fetchuser, checkAdmin, async (req, res) => {
    try {
        const postId = req.params.postId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid post ID format" 
            });
        }

        const post = await Notes.findById(postId);
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                error: "Post not found" 
            });
        }

        // Delete the post
        await Notes.findByIdAndDelete(postId);

        res.json({
            success: true,
            message: `Post "${post.title}" has been deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 6: Get user details by ID - Updated to include posts count
router.get('/users/:userId', fetchuser, checkAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid user ID format" 
            });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        // Get user's posts count
        const postsCount = await Notes.countDocuments({ user: userId });

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                postsCount
            }
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 7: Toggle user admin status
router.put('/users/:userId/toggle-admin', fetchuser, checkAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid user ID format" 
            });
        }

        // Prevent admin from removing their own admin status
        if (userId === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                error: "You cannot modify your own admin status" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.name} has been ${user.isAdmin ? 'promoted to admin' : 'removed from admin'}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Error toggling admin status:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

module.exports = router;