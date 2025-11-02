const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing Authorization header',
    });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',  
      message: 'Missing bearer token',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired',
      });
    }
    req.user = user; // contains { userId, role, ... }
    next();
  });
}

module.exports = { authenticateToken };