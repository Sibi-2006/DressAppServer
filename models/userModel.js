const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_number: { type: String, required: true },
  whatsapp_number: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Check for the first registered user to be admin@tshirt.com auto-admin in controller or presave hook.
module.exports = mongoose.model('User', userSchema);
