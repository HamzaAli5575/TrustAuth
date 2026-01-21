const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  provider: { type: String, default: 'local' }, // Tracks if user is 'local' or 'keycloak'
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  logs: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
      ip: String
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);