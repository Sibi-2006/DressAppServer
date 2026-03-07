const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, unique: true },
    payment: {
        method: { type: String, default: 'UPI' },
        status: { type: String, enum: ['PENDING', 'VERIFICATION_PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'], default: 'PENDING' },
        upi_ref_id: { type: String },
        utr_number: { type: String },
        amount: { type: Number },
        paid_at: { type: Date }
    },
    order_total: { type: Number },
    items: [
        {
            name: { type: String },
            color: { type: String, required: true },
            size: { type: String, required: true },
            side: { type: String },
            fit_type: { type: String, enum: ['NORMAL_FIT', 'OVERSIZED_FIT'], default: 'NORMAL_FIT' },
            // Legacy/fallback properties
            image: { type: String },
            front_image: { type: String },
            back_image: { type: String },
            front_position: { type: Object, default: { x: 50, y: 50 } },
            back_position: { type: Object, default: { x: 50, y: 50 } },
            front_size: { type: Object, default: { w: 40, h: 40 } },
            back_size: { type: Object, default: { w: 40, h: 40 } },
            // New multiple images properties
            front_images: { type: Array, default: [] },
            back_images: { type: Array, default: [] },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true }
        }
    ],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    client_note: { type: String, maxlength: 300 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
