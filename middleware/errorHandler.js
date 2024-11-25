const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (req.xhr) {
        // Handle AJAX requests
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        });
    } else {
        // Handle regular requests
        res.status(500).render('error', {
            error: 'Something went wrong!'
        });
    }
};

module.exports = errorHandler; 