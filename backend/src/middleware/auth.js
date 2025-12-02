const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticateToken(req, res, next) {
    // Try to get token from cookie first
    let token = req.cookies?.authToken;

    // Fallback to Authorization header for API clients
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