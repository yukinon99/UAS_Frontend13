const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const Product = require('./models/Product');
const mongoose = require('mongoose');
const Review = require('./models/Review');



// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 100000
}));

app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
    }
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
app.post('/auth/login', authController.login, (req, res, next) => {
    if (req.user) {
        req.session.user = req.user;
        res.json({ success: true });
    } else {
        next(new Error('Login failed'));
    }
});
app.post('/auth/logout', authController.logout);
app.post('/auth/delete', isAuthenticated, authController.deleteAccount);
app.post('/auth/update', isAuthenticated, profileController.updateProfile);

// Page routes
app.get('/', (req, res) => res.render('main'));
app.get('/profile', isAuthenticated, (req, res) => {
    try {
        res.render('profile.html', { 
            user: req.session.user 
        });
    } catch (error) {
        console.error('Error rendering profile:', error);
        next(error);
    }
});
app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/profile');
    } else {
        res.render('login', { error: undefined });
    }
});
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
    if (req.session && req.session.user) {
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

app.get('/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/review.html'));
});

// Dummy data untuk wishlist
let wishlists = [
    { id: 1, name: 'Headset A', brand: 'Brand A', price: 500000, image: '/images/headset-a.jpg', productUrl: '/product/1' },
    { id: 2, name: 'Headset B', brand: 'Brand B', price: 750000, image: '/images/headset-b.jpg', productUrl: '/product/2' },
    // Tambahkan data lainnya sesuai kebutuhan
];

// Endpoint untuk mendapatkan daftar wishlist
app.get('/api/wishlists', (req, res) => {
    res.json(wishlists);
});

// Endpoint untuk menghapus item dari wishlist
app.delete('/api/wishlists/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const index = wishlists.findIndex(item => item.id === itemId);

    if (index !== -1) {
        wishlists.splice(index, 1);
        res.status(200).json({ message: 'Item berhasil dihapus dari wishlist' });
    } else {
        res.status(404).json({ message: 'Item tidak ditemukan' });
    }
});

// Set folder 'public' dan 'views' sebagai folder statis
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Route untuk halaman utama
app.get('/main.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/main.html'));
});

// Route untuk halaman pencarian
app.get('/search.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/search.html'));
});

// Endpoint untuk menambah produk baru
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            brand: req.body.brand,
            type: req.body.type,
            price: parseFloat(req.body.price),
            image: req.body.image,
            description: req.body.description
        });
        
        const savedProduct = await newProduct.save();
        res.status(201).json({ 
            ...savedProduct._doc,
            message: 'Product added successfully' 
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            error: 'Failed to add product',
            details: error.message 
        });
    }
});

// GET products endpoint
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Tambahkan endpoint DELETE
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validasi ID valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ 
                error: 'Invalid product ID',
                details: 'The provided ID is not valid' 
            });
        }

        // Cari dan hapus produk
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            return res.status(404).json({ 
                error: 'Product not found',
                details: 'Product with the specified ID does not exist' 
            });
        }

        res.json({ 
            message: 'Product deleted successfully',
            product: deletedProduct 
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            error: 'Failed to delete product',
            details: error.message 
        });
    }
});

// Update product endpoint
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return updated document
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Review endpoints
app.post('/api/reviews', async (req, res) => {
    try {
        const newReview = new Review({
            productName: req.body.productName,
            brand: req.body.brand,
            rating: req.body.rating,
            comment: req.body.comment
        });
        
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching reviews',
            error: error.message 
        });
    }
});

// Create new review
app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review({
            productName: req.body.productName,
            brand: req.body.brand,
            rating: req.body.rating,
            comment: req.body.comment
        });

        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating review',
            error: error.message 
        });
    }
});

// Update review
app.put('/api/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                productName: req.body.productName,
                brand: req.body.brand,
                rating: req.body.rating,
                comment: req.body.comment
            },
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating review',
            error: error.message 
        });
    }
});

// Delete review
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting review',
            error: error.message 
        });
    }
});

// Like review
app.post('/api/reviews/:id/like', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error liking review',
            error: error.message 
        });
    }
});

// Dislike review
app.post('/api/reviews/:id/dislike', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { dislikes: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error disliking review',
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `🌐 Local: http://localhost:${PORT}`);
});
module.exports = app; 
