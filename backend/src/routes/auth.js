const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { JWT_SECRET } = require('../config');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
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

        if (!email || !password || !firstName || !lastName || !phone || !role) {
            console.error('Signup: missing required fields');
            return res.status(400).json({
                message: 'Missing required fields',
                errors: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null,
                    firstName: !firstName ? 'First name is required' : null,
                    lastName: !lastName ? 'Last name is required' : null,
                    phone: !phone ? 'Phone is required' : null,
                    role: !role ? 'Role is required' : null
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {

            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Validate admin code if registering as admin
        const validAdminCode = process.env.ADMIN_CODE || 'CARCRAZE_ADMIN_2024';
        if (role === 'admin' && adminCode !== validAdminCode) {
            return res.status(403).json({ message: 'Invalid admin code' });
        }

        // Create user based on role
        const userData = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password, // Will be hashed by the pre-save hook
            phone,
            role: role || 'customer'
        };

        // Add business info for sellers
        if (role === 'seller' && businessInfo) {

            userData.businessInfo = businessInfo;
        }


        const user = new User(userData);
        await user.save();

        // Send welcome email asynchronously so it doesn't block the response
        sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set token as HttpOnly cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
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
        // Send more detailed error information
        res.status(500).json({
            message: 'Registration failed',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

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

        // Update last login and history
        user.lastLogin = new Date();
        user.loginHistory.push({
            timestamp: new Date(),
            ip: req.ip || req.connection.remoteAddress,
            success: true
        });
        // Keep only the last 20 logins to avoid blowing up the document size
        if (user.loginHistory.length > 20) {
            user.loginHistory = user.loginHistory.slice(-20);
        }
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set token as HttpOnly cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

        // Find user
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                message: 'First name, last name, and phone are required'
            });
        }

        // Update user fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;

        // Update business info for sellers
        if (user.role === 'seller' && businessInfo) {
            user.businessInfo = businessInfo;
        }

        await user.save();

        // Return updated user data (excluding password)
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
        sameSite: 'lax'
    });
    res.json({ message: 'Logout successful' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always respond with success to prevent user enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Store hashed version in DB for security
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send plain token in the email (not the hash)
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

        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() } // must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        // Set new password and clear reset fields
        user.password = password; // pre-save hook will hash it
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