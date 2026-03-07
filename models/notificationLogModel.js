const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    phone: { type: String, required: true },
    statusSent: { type: String, required: true },
    result: { type: String, enum: ['Sent', 'Failed'], required: true },
    errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
