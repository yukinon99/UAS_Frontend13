const auth = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            if (req.xhr) {
                // For AJAX requests
                res.status(401).json({
                    success: false,
                    message: 'Please login first'
                });
            } else {
                // For regular requests
                res.redirect('/login');
            }
        }
    }
};

module.exports = auth; 