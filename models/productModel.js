const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fit_type: {
        type: String,
        enum: ['NORMAL_FIT', 'OVERSIZED_FIT'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    colors: [String],
    sizes: [String],
    description: String,
    images: {
        type: mongoose.Schema.Types.Mixed
    },
    in_stock: {
        type: Boolean,
        default: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
