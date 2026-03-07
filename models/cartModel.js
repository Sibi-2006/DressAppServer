const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            name: String,
            fit_type: {
                type: String,
                enum: ['NORMAL_FIT', 'OVERSIZED_FIT'],
                required: true
            },
            size: { type: String, required: true },
            color: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true },
            front_images: Array,
            back_images: Array,
            client_note: String
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
