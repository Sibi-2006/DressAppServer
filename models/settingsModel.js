const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    twilioSid: { type: String, default: '' },
    twilioAuthToken: { type: String, default: '' },
    whatsappSender: { type: String, default: '+917598382584' },
    templates: {
        Pending: { type: String, default: "Dear [Client Name], your order #[Order ID] has been placed successfully and is currently pending. We will process it shortly. Thank you for shopping with us! 🛍️" },
        Processing: { type: String, default: "Dear [Client Name], great news! Your order #[Order ID] is now being processed. We are preparing your customized t-shirt with care. Stay tuned! 👕✨" },
        Shipped: { type: String, default: "Dear [Client Name], your order #[Order ID] has been shipped! 🚚 Your customized t-shirt is on its way to you. You will receive it soon. Thank you for your patience!" },
        Delivered: { type: String, default: "Dear [Client Name], your order #[Order ID] has been delivered successfully! ✅ We hope you love your customized t-shirt. Thank you for shopping with us! 😊" },
        Cancelled: { type: String, default: "Dear [Client Name], your order #[Order ID] has been cancelled. ❌ If you have any questions, please contact us. We hope to serve you again soon!" }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
