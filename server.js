const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profileRoutes');

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Set view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Tambahkan middleware isAuthenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Auth routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.post('/auth/delete', isAuthenticated, authController.deleteAccount);
app.post('/auth/update', isAuthenticated, profileController.updateProfile);

// Page routes
app.get('/', (req, res) => res.render('main'));
app.get('/profile', isAuthenticated, (req, res, next) => {
    try {
        res.render('profile.html', { 
            user: req.session.user || {} 
        });
    } catch (error) {
        console.error('Error rendering profile:', error);
        next(error); // Pass error ke error handler
    }
});
app.get('/login', (req, res) => res.render('login', { error: undefined }));
app.get('/register', (req, res) => res.render('register', { error: undefined }));

// Register routes
app.use(authRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// Error handler middleware (tambahkan di bagian bawah file)
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Endpoint untuk cek session
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// Route untuk profile dengan session check
app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile.html', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `🌐 Local: http://localhost:${PORT}`);
});

module.exports = app; 