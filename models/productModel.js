const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    color: { type: String, required: true },
    hex: { type: String, required: true },
    price: { type: Number, required: true, default: 25 },
    fit_type: { type: String, enum: ['NORMAL_FIT', 'OVERSIZED_FIT'], default: 'NORMAL_FIT' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
