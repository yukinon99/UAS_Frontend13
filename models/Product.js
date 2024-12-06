const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
        enum: ['Razer', 'HyperX', 'SteelSeries', 'Logitech', 'Sony', 'Bose', 'JBL']
    },
    type: {
        type: String,
        required: true,
        enum: ['Gaming', 'Sports', 'Casual']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'product'
});

module.exports = mongoose.model('Product', ProductSchema);