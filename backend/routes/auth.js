const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Prantoisagoodb$oy'; // Add your actual secret here
var fetchuser = require('../middleware/fetchuser'); 



//Route 1 : Create a user using: POST "/api/auth/createuser"
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
  body('nidNumber', 'National ID Number is required').notEmpty(),
  body('phoneNumber', 'Enter a valid phone number').optional().isMobilePhone(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ 
      $or: [
        { email: req.body.email },
        { nidNumber: req.body.nidNumber },
        { phoneNumber: req.body.phoneNumber }
      ]
    });

    if (user) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email, NID, or phone number' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
      nidNumber: req.body.nidNumber,
      phoneNumber: req.body.phoneNumber,
      bio: req.body.bio,
      profilePic: req.body.profilePic,
      isAdmin: false // default value
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occurred");
  }
});
//Route 2: Authenticate a user using: POST "/api/auth/login" . No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return bad request and the errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authtoken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 3: Get loggedin user details using: POST "/api/auth/getuser" . Login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user); 
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


//Route 4:
router.put('/updateuser', fetchuser, [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('phoneNumber', 'Enter a valid phone number').optional().isMobilePhone(),
    body('bio', 'Bio cannot exceed 500 characters').optional().isLength({ max: 500 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, phoneNumber, bio, profilePic } = req.body;
        const userId = req.user.id;

        // Check if email already exists for another user
        const existingUser = await User.findOne({ 
            email, 
            _id: { $ne: userId } 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email already in use' 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    name,
                    email,
                    phoneNumber,
                    bio,
                    profilePic
                }
            },
            { new: true }
        ).select('-password');

        res.json({ 
            success: true, 
            user: updatedUser 
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Add these routes to your auth.js file

// Route 5: Get user profile by ID (public access): GET "/api/auth/getuser/:userId"
router.get('/getuser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const user = await User.findById(userId).select("-password -nidNumber");
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = router;
