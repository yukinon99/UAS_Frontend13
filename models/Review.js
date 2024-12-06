const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
        enum: ['Sony', 'Bose', 'HyperX', 'Razer', 'Logitech', 'SteelSeries', 'JBL']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    likes: { 
        type: Number, 
        default: 0 
    },
    dislikes: { 
        type: Number, 
        default: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    collection: 'review'
});

module.exports = mongoose.model('Review', reviewSchema); 