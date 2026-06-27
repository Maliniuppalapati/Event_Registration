const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const role = 'student'; 
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User exists' });

    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
        const errorMessages = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
        return res.status(400).json({ msg: errorMessages });
    }
    res.status(500).json({ msg: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body; 
  if (!email || !password) return res.status(400).json({ msg: 'Please enter all fields' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    if (role && user.role !== role) {
        return res.status(400).json({ msg: `Invalid login attempt for role: ${role}` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

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