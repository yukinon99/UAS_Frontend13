const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Jika request adalah AJAX/API
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: process.env.NODE_ENV === 'development' ? err.message : {}
        });
    }
    
    // Jika request biasa, redirect ke halaman error atau login
    res.redirect('/login');
};

module.exports = errorHandler; 