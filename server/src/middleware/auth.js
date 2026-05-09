const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ ok: false, error: 'Missing authorization header' });
    }
    
    const token = header.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ ok: false, error: 'Invalid authorization format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ ok: false, error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: 'Invalid token', details: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    next();
  };
};

module.exports = { auth, authorize };
