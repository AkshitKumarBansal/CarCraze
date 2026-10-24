const crypto = require('crypto');
const User = require('../../models/User');
const { sendPasswordResetEmail } = require('../../utils/emailService');
const { validatePassword } = require('../../utils/passwordPolicy');

// Forgot password function that sends a reset email

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.json({
                message: 'If that email exists, a reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

        await user.save();

        await sendPasswordResetEmail(user, resetToken);

        return res.json({
            message: 'If that email exists, a reset link has been sent.'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

// Reset password function that validates the token and updates the password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
        const passwordValidation = validatePassword(password);

        if (!passwordValidation.valid) {
            return res.status(400).json({
                message: passwordValidation.message
            });
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }
        user.password = password;

        // Invalidate tokens issued before this password change.
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.json({
            message: 'Password reset successful. Please sign in again.'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { forgotPassword, resetPassword };