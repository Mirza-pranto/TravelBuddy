// routes/admin.js - Updated with Report model import
const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const User = require('../models/User');
const Report = require('../models/Report'); // Added Report model import
const fetchuser = require('../middleware/fetchuser');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

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

// Route 1: Get all users with pagination and search
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

        // Get users with posts count
        const users = await User.find(searchQuery)
            .select('-password')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        // Add posts count to each user
        const usersWithPostsCount = await Promise.all(
            users.map(async (user) => {
                const postsCount = await Notes.countDocuments({ user: user._id });
                return {
                    ...user.toObject(),
                    postsCount
                };
            })
        );

        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            success: true,
            users: usersWithPostsCount,
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

// Route 2: Get all posts with pagination and search
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

// Route 3: Delete a user account
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

// Route 4: Delete a post
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

// Route 5: Get user details by ID
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

// Route 6: Toggle user admin status
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

// Route 7: Get all reports with pagination and filters
router.get('/reports', fetchuser, checkAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // Build filter query
        let filterQuery = {};
        if (status) {
            filterQuery.status = status;
        }

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { 'reporter.name': { $regex: search, $options: 'i' } },
                    { 'reporter.email': { $regex: search, $options: 'i' } },
                    { 'reportedUser.name': { $regex: search, $options: 'i' } },
                    { 'reportedUser.email': { $regex: search, $options: 'i' } },
                    { reason: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const finalQuery = { ...filterQuery, ...searchQuery };

        const reports = await Report.find(finalQuery)
            .populate('reporter', 'name email profilePic')
            .populate('reportedUser', 'name email profilePic')
            .populate('resolvedBy', 'name')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalReports = await Report.countDocuments(finalQuery);
        const totalPages = Math.ceil(totalReports / limit);

        // Get counts for each status
        const statusCounts = await Report.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCountsObj = statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.json({
            success: true,
            reports,
            statusCounts: statusCountsObj,
            pagination: {
                currentPage: page,
                totalPages,
                totalReports,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

// Route 8: Update report status - PUT "/api/admin/reports/:reportId"
router.put('/reports/:reportId', fetchuser, checkAdmin, [
    body('status', 'Status must be one of: pending, reviewed, resolved, dismissed')
        .isIn(['pending', 'reviewed', 'resolved', 'dismissed']),
    body('adminNotes', 'Admin notes must be less than 1000 characters').optional().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const reportId = req.params.reportId;
        const { status, adminNotes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid report ID format"
            });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: "Report not found"
            });
        }

        // Update report
        report.status = status;
        if (adminNotes !== undefined) {
            report.adminNotes = adminNotes;
        }

        if (status === 'resolved' || status === 'dismissed') {
            report.resolvedBy = req.user.id;
            report.resolvedAt = new Date();
        }

        await report.save();

        // Populate data for response
        await report.populate('reporter', 'name email profilePic');
        await report.populate('reportedUser', 'name email profilePic');
        await report.populate('resolvedBy', 'name');

        res.json({
            success: true,
            message: `Report ${status} successfully`,
            report
        });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

// Route 9: Get report statistics - GET "/api/admin/reports-stats"
router.get('/reports-stats', fetchuser, checkAdmin, async (req, res) => {
    try {
        // Total reports count
        const totalReports = await Report.countDocuments();

        // Reports by status
        const reportsByStatus = await Report.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Reports by reason
        const reportsByReason = await Report.aggregate([
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly reports count for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyReports = await Report.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                $limit: 6
            }
        ]);

        // Most reported users
        const mostReportedUsers = await Report.aggregate([
            {
                $group: {
                    _id: '$reportedUser',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    email: '$user.email',
                    profilePic: '$user.profilePic',
                    reportCount: '$count'
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalReports,
                reportsByStatus,
                reportsByReason,
                monthlyReports,
                mostReportedUsers
            }
        });
    } catch (error) {
        console.error("Error fetching report statistics:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

module.exports = router;