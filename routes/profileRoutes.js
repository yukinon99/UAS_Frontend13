const express = require('express');
const router = express.Router();
const path = require('path');

// Route untuk halaman profile
router.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'profile.html'));
});

module.exports = router; 