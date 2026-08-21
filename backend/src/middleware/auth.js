const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  let token = req.cookies?.authToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authentication token',
    });
  }

  // Use process.env directly instead of the old config file
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || !user) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired',
      });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, isAdmin };