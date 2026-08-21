const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');
// 1. Import both secrets from the centralized config
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_CODE = process.env.ADMIN_CODE;

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') console.log('Received signup request body keys:', Object.keys(req.body));

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            businessInfo,
            adminCode,
        } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // 2. Validate using the guaranteed ADMIN_CODE from config
        if (role === 'admin' && adminCode !== ADMIN_CODE) {
            return res.status(403).json({ message: 'Invalid admin code' });
        }

        const userData = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password, 
            phone,
            role: role || 'customer'
        };

        if (role === 'seller' && businessInfo) {
            userData.businessInfo = businessInfo;
        }

        const user = new User(userData);
        await user.save();

        sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'Signup successful',
            user: {
                id: user._id,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({
            message: 'Registration failed',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// POST /api/auth/signin
router.post('/signin', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been permanently banned.' });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account is currently deactivated.' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            $push: {
                loginHistory: {
                    $each: [{
                        timestamp: new Date(),
                        ip: req.ip || req.connection.remoteAddress,
                        success: true
                    }],
                    $slice: -20
                }
            }
        });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({
            message: 'Signin successful',
            user: {
                id: user._id,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            ...(user.role === 'seller' && {
                businessInfo: user.businessInfo,
                rating: user.rating
            })
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, businessInfo } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                message: 'First name, last name, and phone are required'
            });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;

        if (user.role === 'seller' && businessInfo) {
            user.businessInfo = businessInfo;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                ...(user.role === 'seller' && {
                    businessInfo: user.businessInfo,
                    rating: user.rating
                })
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: err.message || 'Failed to update profile' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Logout successful' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; 
        await user.save();

        sendPasswordResetEmail(user, resetToken).catch(err => console.error('Failed to send reset email:', err));

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        user.password = password; 
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;