const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { sendWelcomeEmail } = require('../../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_CODE = process.env.ADMIN_CODE;

// Signup function with email sending
const signup = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') console.log('Received signup request body keys:', Object.keys(req.body));
        const { firstName, lastName, email, password, phone, role, businessInfo, adminCode } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }
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
            maxAge: 7 * 24 * 60 * 60 * 1000
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
};

// Signin function with account status checks
const signin = async (req, res) => {
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
};

// Logout function that clears the auth cookie
const logout = (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Logout successful' });
};

module.exports = { signup, signin, logout };