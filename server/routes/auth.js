const express = require('express');
const router = express.Router();
const { signup, login, getUsers, changePassword } = require('../controllers/authController');
const { oauthCallback } = require('../controllers/oauthController');
const { authenticate, authorize, checkmTLS, refreshToken } = require('../middleware/auth');

// --- PUBLIC ROUTES ---

// 1. User Registration
router.post('/signup', signup);

// 2. User Login (Local)
router.post('/login', login);

// 3. OAuth2.0 Callback (Keycloak)
router.get('/auth/callback', oauthCallback);

// 4. Refresh Token (Get new Access Token via HTTP-only Cookie)
router.post('/refresh', refreshToken);

// --- PROTECTED ROUTES ---

// 5. Get Current User Profile
router.get('/profile', authenticate, (req, res) => res.json(req.user));

// --- ADMIN ONLY ROUTES ---

// 6. Update User Role (RBAC)
router.put('/admin/users/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate Role Input
    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const User = require('../models/User');
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { role }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update User Password (Admin Only)
// Note: We don't use checkmTLS here to allow easier testing of password changes, 
// but you can add it to the array below: authenticate, authorize('admin'), checkmTLS
router.put('/admin/users/:id/password', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const User = require('../models/User');
    const bcrypt = require('bcryptjs'); // Import bcryptjs here

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { password: hashedPassword }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. View All Users (Admin Only)
// If mTLS is strictly required for production, add 'checkmTLS' to the array below: authenticate, authorize('admin')
router.get('/admin/users', authenticate, authorize('admin'), getUsers);

// 9. View Activity Logs (Admin Only)
router.get('/admin/logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('username logs');
    
    // Flatten logs: Transform array of users into single array of log objects
    const allLogs = users
      .map(user => 
        user.logs.map(log => ({
          ...log.toObject(),
          username: user.username
        }))
      )
      .flat();

    // Sort logs so newest appears first
    allLogs.sort((a, b) => b.timestamp - a.timestamp);

    res.json(allLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;