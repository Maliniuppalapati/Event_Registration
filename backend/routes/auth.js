// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\backend\routes\auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route (Student only)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // Force the role to 'student' for anyone using the /register endpoint
  const role = 'student'; 
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User exists' });

    const user = await User.create({ name, email, password, role });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body; // Receive requested role
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // 1. Check if the requested role matches the user's role in the DB
    if (role && user.role !== role) {
        return res.status(400).json({ msg: `Invalid login attempt for role: ${role}` });
    }

    // 2. Check password against the hash stored in the DB (applies to both roles)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Note: The previous redundant check against process.env.ORGANIZER_EMAIL is removed,
    // as the successful password match is sufficient for authorization.

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;