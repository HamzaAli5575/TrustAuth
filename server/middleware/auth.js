const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Verify JWT Token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

// 2. Check Roles (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not Authorized' });
    }
    next();
  };
};

// 3. Check mTLS (Mutual TLS)
exports.checkmTLS = (req, res, next) => {
  if (!req.client.authorized) {
    return res.status(403).json({ message: 'mTLS Required: Client Certificate Missing' });
  }
  next();
};

// 4. Refresh Token Logic
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: 'No Refresh Token' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "super_secret_refresh", { ignoreExpiration: true });
    const user = await User.findById(decoded.id);

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid Refresh Token' });
  }
};