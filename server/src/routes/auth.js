const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      ok: true,
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'Username, password, and role are required' });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'Username already exists' });
    }
    
    const user = new User({ username, password, role, name, email });
    await user.save();
    
    res.status(201).json({ ok: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ ok: false, error: 'Username already exists' });
    } else {
      res.status(500).json({ ok: false, error: 'Registration failed' });
    }
  }
});

module.exports = router;
