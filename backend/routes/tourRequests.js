const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Route 1: Send a join request for a tour: POST "/api/tour-requests/send/:noteId"
router.post('/send/:noteId', fetchuser, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid tour ID format" 
            });
        }

        // Find the tour post
        const tour = await Notes.findById(noteId);
        if (!tour) {
            return res.status(404).json({ 
                success: false, 
                error: "Tour not found" 
            });
        }

        // Check if user is trying to join their own tour
        if (tour.user.toString() === userId) {
            return res.status(400).json({ 
                success: false, 
                error: "You cannot join your own tour" 
            });
        }

        // Check if user already sent a request
        const existingRequest = tour.joinRequests.find(
            request => request.user.toString() === userId
        );

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ 
                    success: false, 
                    error: "You have already sent a join request for this tour" 
                });
            } else if (existingRequest.status === 'accepted') {
                return res.status(400).json({ 
                    success: false, 
                    error: "You are already a member of this tour" 
                });
            } else if (existingRequest.status === 'rejected') {
                // Allow re-requesting if previously rejected
                existingRequest.status = 'pending';
                existingRequest.requestedAt = new Date();
                existingRequest.processedAt = undefined;
            }
        } else {
            // Check if tour is full
            if (tour.tourMates.length >= tour.maxTourMates) {
                return res.status(400).json({ 
                    success: false, 
                    error: "This tour is already full" 
                });
            }

            // Add new join request
            tour.joinRequests.push({
                user: userId,
                status: 'pending',
                requestedAt: new Date()
            });
        }

        await tour.save();

        res.json({ 
            success: true, 
            message: "Join request sent successfully",
            requestStatus: 'pending'
        });

    } catch (error) {
        console.error("Error sending join request:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 2: Get all join requests for a tour (only for tour creator): GET "/api/tour-requests/manage/:noteId"
router.get('/manage/:noteId', fetchuser, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid tour ID format" 
            });
        }

        const tour = await Notes.findById(noteId)
            .populate('joinRequests.user', 'name email profilePic averageRating totalRatings')
            .populate('tourMates', 'name email profilePic averageRating totalRatings');

        if (!tour) {
            return res.status(404).json({ 
                success: false, 
                error: "Tour not found" 
            });
        }

        // Check if user is the tour creator
        if (tour.user.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: "Access denied. Only tour creator can manage requests" 
            });
        }

        res.json({
            success: true,
            joinRequests: tour.joinRequests,
            tourMates: tour.tourMates,
            maxTourMates: tour.maxTourMates,
            availableSpots: tour.maxTourMates - tour.tourMates.length
        });

    } catch (error) {
        console.error("Error fetching join requests:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 3: Accept or reject a join request: PUT "/api/tour-requests/respond/:noteId/:requestId"
router.put('/respond/:noteId/:requestId', fetchuser, [
    body('action', 'Action must be either accept or reject').isIn(['accept', 'reject'])
], async (req, res) => {
    try {
        const { noteId, requestId } = req.params;
        const { action } = req.body;
        const userId = req.user.id;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(noteId) || !mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid ID format" 
            });
        }

        const tour = await Notes.findById(noteId);
        if (!tour) {
            return res.status(404).json({ 
                success: false, 
                error: "Tour not found" 
            });
        }

        // Check if user is the tour creator
        if (tour.user.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: "Access denied. Only tour creator can respond to requests" 
            });
        }

        // Find the specific join request
        const joinRequest = tour.joinRequests.id(requestId);
        if (!joinRequest) {
            return res.status(404).json({ 
                success: false, 
                error: "Join request not found" 
            });
        }

        // Check if request is still pending
        if (joinRequest.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: `This request has already been ${joinRequest.status}` 
            });
        }

        if (action === 'accept') {
            // Check if tour is full
            if (tour.tourMates.length >= tour.maxTourMates) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Cannot accept request. Tour is already full" 
                });
            }

            // Accept the request
            joinRequest.status = 'accepted';
            joinRequest.processedAt = new Date();
            
            // Add user to tour mates if not already added
            if (!tour.tourMates.includes(joinRequest.user)) {
                tour.tourMates.push(joinRequest.user);
            }

        } else if (action === 'reject') {
            // Reject the request
            joinRequest.status = 'rejected';
            joinRequest.processedAt = new Date();
            
            // Remove user from tour mates if they were previously accepted
            tour.tourMates = tour.tourMates.filter(
                mateId => mateId.toString() !== joinRequest.user.toString()
            );
        }

        await tour.save();

        res.json({
            success: true,
            message: `Join request ${action}ed successfully`,
            requestStatus: joinRequest.status,
            availableSpots: tour.maxTourMates - tour.tourMates.length
        });

    } catch (error) {
        console.error("Error responding to join request:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 4: Get user's join request status for a specific tour: GET "/api/tour-requests/status/:noteId"
router.get('/status/:noteId', fetchuser, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid tour ID format" 
            });
        }

        const tour = await Notes.findById(noteId).select('joinRequests tourMates user maxTourMates');
        if (!tour) {
            return res.status(404).json({ 
                success: false, 
                error: "Tour not found" 
            });
        }

        // Check if user is the tour creator
        const isCreator = tour.user.toString() === userId;
        
        // Find user's join request
        const userRequest = tour.joinRequests.find(
            request => request.user.toString() === userId
        );

        // Check if user is already a tour mate
        const isTourMate = tour.tourMates.includes(userId);

        res.json({
            success: true,
            isCreator,
            isTourMate,
            requestStatus: userRequest ? userRequest.status : null,
            requestDate: userRequest ? userRequest.requestedAt : null,
            isFull: tour.tourMates.length >= tour.maxTourMates,
            availableSpots: tour.maxTourMates - tour.tourMates.length,
            totalMates: tour.tourMates.length
        });

    } catch (error) {
        console.error("Error getting request status:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

// Route 5: Get user's all join requests: GET "/api/tour-requests/my-requests"
router.get('/my-requests', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;

        const tours = await Notes.find({ 
            'joinRequests.user': userId 
        })
        .select('title destination startDate endDate joinRequests user')
        .populate('user', 'name profilePic');

        const myRequests = tours.map(tour => {
            const myRequest = tour.joinRequests.find(
                request => request.user.toString() === userId
            );
            
            return {
                tourId: tour._id,
                tourTitle: tour.title,
                destination: tour.destination,
                startDate: tour.startDate,
                endDate: tour.endDate,
                creator: tour.user,
                requestStatus: myRequest.status,
                requestedAt: myRequest.requestedAt,
                processedAt: myRequest.processedAt
            };
        });

        res.json({
            success: true,
            requests: myRequests
        });

    } catch (error) {
        console.error("Error fetching user requests:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
});

module.exports = router;