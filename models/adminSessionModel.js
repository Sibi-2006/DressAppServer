const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ip_address: String,
    user_agent: String,
    is_active: {
        type: Boolean,
        default: true
    },
    expires_at: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminSession', adminSessionSchema);
