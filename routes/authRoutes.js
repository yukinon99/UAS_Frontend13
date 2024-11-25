const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

// Auth routes
router.post('/register', isNotAuthenticated, authController.register);
router.post('/login', isNotAuthenticated, authController.login);
router.get('/logout', authController.logout);

module.exports = router; 