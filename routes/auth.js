const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).render('register', { error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).render('register', { error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render('login', { error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { error: 'Invalid credentials' });
    }

    req.session.user = user;
    res.redirect('/profile');
  } catch (err) {
    res.status(500).render('login', { error: 'Server error' });
  }
});

// Update Profile
router.post('/update', async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.session.user._id;

    await User.findByIdAndUpdate(userId, {
      username,
      email
    });

    req.session.user = await User.findById(userId);
    res.render('profile', { 
      user: req.session.user, 
      error: undefined,
      success: 'Profile updated successfully!' 
    });
  } catch (err) {
    res.status(500).render('profile', { 
      user: req.session.user,
      error: 'Update failed',
      success: undefined 
    });
  }
});

// Delete Account
router.post('/delete', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.user._id);
    req.session.destroy();
    res.redirect('/login');
  } catch (err) {
    res.status(500).render('profile', { error: 'Delete failed' });
  }
});

module.exports = router; 