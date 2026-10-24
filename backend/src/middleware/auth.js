const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  // Fail safely if the server is missing its JWT configuration.
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured.');

    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Authentication is temporarily unavailable.',
    });
  }

  let token = req.cookies?.authToken;

  // Support Authorization: Bearer <token> as a fallback.
  if (!token) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !decoded.userId
    ) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token payload is invalid.',
      });
    }

    // Confirm that the account still exists and is active.
    const user = await User.findById(decoded.userId)
      .select('_id role isActive isBanned tokenVersion');

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The account associated with this token no longer exists.',
      });
    }

    if (user.isBanned || !user.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This account is disabled.',
      });
    }

    // Use the current database role, not the possibly outdated JWT role.
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    const currentTokenVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion;

    if (
        !Number.isInteger(tokenVersion) ||
        tokenVersion !== currentTokenVersion
    ) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Your session is no longer valid. Please sign in again.'
        });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'NotBeforeError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired.',
      });
    }

    console.error('Authentication middleware failed:', {
      name: error.name,
      code: error.code,
    });

    return res.status(500).json({
      error: 'Server error',
      message: 'Unable to authenticate this request.',
    });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required.',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
};
