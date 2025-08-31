const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Route 1: Report a user - POST "/api/reports/report-user"
router.post('/report-user', fetchuser, [
    body('reportedUserId', 'Reported user ID is required').isMongoId(),
    body('reason', 'Reason is required').isIn(['Spam', 'Harassment', 'Inappropriate Content', 'Fake Profile', 'Other']),
    body('description', 'Description must be less than 500 characters').optional().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { reportedUserId, reason, description, evidence } = req.body;
        const reporterId = req.user.id;

        // Check if user is trying to report themselves
        if (reporterId === reportedUserId) {
            return res.status(400).json({
                success: false,
                error: "You cannot report yourself"
            });
        }

        // Check if reported user exists
        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser) {
            return res.status(404).json({
                success: false,
                error: "Reported user not found"
            });
        }

        // Check if user has already reported this user (pending reports only)
        const existingReport = await Report.findOne({
            reporter: reporterId,
            reportedUser: reportedUserId,
            status: 'pending'
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                error: "You have already reported this user. Your report is pending review."
            });
        }

        // Create new report
        const report = new Report({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason,
            description,
            evidence: evidence || []
        });

        await report.save();

        // Populate reporter and reported user details for response
        await report.populate('reporter', 'name email profilePic');
        await report.populate('reportedUser', 'name email profilePic');

        res.json({
            success: true,
            message: "User reported successfully. Our team will review your report.",
            report
        });

    } catch (error) {
        console.error("Error reporting user:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

// Route 2: Get user's report history - GET "/api/reports/my-reports"
router.get('/my-reports', fetchuser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reports = await Report.find({ reporter: req.user.id })
            .populate('reportedUser', 'name email profilePic')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReports = await Report.countDocuments({ reporter: req.user.id });
        const totalPages = Math.ceil(totalReports / limit);

        res.json({
            success: true,
            reports,
            pagination: {
                currentPage: page,
                totalPages,
                totalReports,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching user reports:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

// Route 3: Get report by ID - GET "/api/reports/:reportId"
router.get('/:reportId', fetchuser, async (req, res) => {
    try {
        const reportId = req.params.reportId;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid report ID format"
            });
        }

        const report = await Report.findById(reportId)
            .populate('reporter', 'name email profilePic')
            .populate('reportedUser', 'name email profilePic')
            .populate('resolvedBy', 'name');

        if (!report) {
            return res.status(404).json({
                success: false,
                error: "Report not found"
            });
        }

        // Check if user is the reporter or admin
        if (report.reporter._id.toString() !== req.user.id) {
            const user = await User.findById(req.user.id);
            if (!user || !user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: "Access denied. You can only view your own reports."
                });
            }
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

module.exports = router;