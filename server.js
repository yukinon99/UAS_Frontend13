const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const { isAuthenticated } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const app = express();

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

// Auth routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.post('/auth/delete', isAuthenticated, authController.deleteAccount);
app.post('/auth/update', isAuthenticated, profileController.updateProfile);

// Page routes
app.get('/', (req, res) => res.render('main'));
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});
app.get('/login', (req, res) => res.render('login', { error: undefined }));
app.get('/register', (req, res) => res.render('register', { error: undefined }));

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `🌐 Local: http://localhost:${PORT}`);
});

module.exports = app; 