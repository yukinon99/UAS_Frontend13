const User = require('../models/User');

const profileController = {
    // Get profile page
    getProfile: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/login');
            res.render('profile', {
                user: req.session.user,
                error: undefined,
                success: undefined
            });
        } catch (err) {
            res.status(500).render('profile', {
                error: 'Failed to load profile'
            });
        }
    },

    // Update profile
    updateProfile: async (req, res) => {
        try {
            const { username, email } = req.body;
            const userId = req.session.user._id;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { username, email },
                { new: true }
            ).select('-password');

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update session user
            req.session.user = updatedUser;

            res.json({
                success: true,
                message: 'Profile updated successfully!',
                user: updatedUser
            });
        } catch (err) {
            console.error('Update error:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    },

    // Delete account
    deleteAccount: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.session.user._id);
            req.session.destroy();
            res.json({ 
                success: true, 
                message: 'Account deleted successfully' 
            });
        } catch (err) {
            res.status(500).json({ 
                success: false, 
                message: 'Delete failed' 
            });
        }
    }
};

module.exports = profileController; 