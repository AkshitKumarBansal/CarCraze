
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { sendWelcomeEmail } = require('../../utils/emailService');
const { validatePassword } = require('../../utils/passwordPolicy');

const JWT_SECRET = process.env.JWT_SECRET;

// Public signup: customers and sellers only.
const signup = async (req, res) => {
    try {
        if (
            process.env.NODE_ENV === 'development'
        ) {
            console.log(
                'Received signup request body keys:',
                Object.keys(req.body)
            );
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            businessInfo
        } = req.body;

        // Never allow public signup to create administrator accounts.
        if (role && !['customer', 'seller'].includes(role)) {
            return res.status(403).json({
                message:
                    'Administrator accounts cannot be created through public signup.'
            });
        }

        // Validate required input.
        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !email?.trim() ||
            !password ||
            !phone?.trim()
        ) {
            return res.status(400).json({
                message: 'Please provide all required fields.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists with this email'
            });
        }

        const passwordValidation = validatePassword(password);

        if (!passwordValidation.valid) {
            return res.status(400).json({
                message: passwordValidation.message
            });
        }

        const assignedRole = role || 'customer';

        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password,
            phone: phone.trim(),
            role: assignedRole
        };

        if (assignedRole === 'seller' && businessInfo) {
            userData.businessInfo = businessInfo;
        }

        const user = new User(userData);
        await user.save();

        // Email delivery should not fail the signup operation.
        sendWelcomeEmail(user).catch((err) => {
            console.error(
                'Failed to send welcome email:',
                err.message
            );
        });

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not configured.');
            return res.status(500).json({
                message: 'Authentication is not configured.'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion ?? 0
            },
            JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
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

        // Handle duplicate email errors, including concurrent requests.
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'User already exists with this email'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: 'Registration failed'
        });
    }
};


// Signin function with account status checks.
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not configured.');
            return res.status(500).json({
                message: 'Authentication is not configured.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                message: 'Your account has been permanently banned.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Your account is currently deactivated.'
            });
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            $push: {
                loginHistory: {
                    $each: [
                        {
                            timestamp: new Date(),
                            ip: req.ip || req.connection.remoteAddress,
                            success: true
                        }
                    ],
                    $slice: -20
                }
            }
        });

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion ?? 0
            },
            JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
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

        return res.status(500).json({
            message: 'Unable to sign in. Please try again.'
        });
    }
};


// Logout function that clears the authentication cookie.
const logout = (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    return res.status(200).json({
        message: 'Logout successful'
    });
};

module.exports = {
    signup,
    signin,
    logout
};