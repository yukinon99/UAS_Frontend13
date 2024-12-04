const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Fungsi validasi password
function isStrongPassword(password) {
    // Minimal 8 karakter
    // Harus mengandung huruf besar, huruf kecil, dan angka
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
}

// Register
router.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validasi password
    if (!isStrongPassword(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka'
        });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
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
    
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email atau password salah' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Email atau password salah' 
      });
    }

    // Set session
    req.session.user = user;

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      redirectUrl: '/main.html'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan saat login' 
    });
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

// Route untuk halaman main
router.get('/main.html', (req, res) => {
    res.sendFile('main.html', { root: './views' });
});

// Route untuk halaman search
router.get('/search.html', (req, res) => {
    res.sendFile('search.html', { root: './views' }); // sesuaikan dengan lokasi file search.html
});

// Route untuk halaman profile
router.get('/profile', (req, res) => {
  res.sendFile('profile.html', { root: './views' });
});

module.exports = router; 