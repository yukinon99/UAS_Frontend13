const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Profile routes
router.get('/', isAuthenticated, profileController.getProfile);
router.post('/update', isAuthenticated, profileController.updateProfile);
router.post('/delete', isAuthenticated, profileController.deleteAccount);

module.exports = router; 