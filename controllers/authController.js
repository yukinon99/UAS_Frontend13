const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            
            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.render('register', { error: 'User already exists' });
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
            console.error(err);
            res.render('register', { error: 'Registration failed' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Check user
            const user = await User.findOne({ email });
            if (!user) {
                return res.render('login', { error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.render('login', { error: 'Invalid credentials' });
            }

            // Set session
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email
            };
            
            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.render('login', { error: 'Login failed' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }
            res.redirect('/login');
        });
    },

    deleteAccount: async (req, res) => {
        try {
            const userId = req.session.user._id;
            await User.findByIdAndDelete(userId);
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Delete account failed'
                    });
                }
                res.json({
                    success: true,
                    message: 'Account deleted successfully'
                });
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Delete account failed'
            });
        }
    }
};

module.exports = authController; 