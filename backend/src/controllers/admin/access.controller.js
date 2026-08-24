const crypto = require('crypto');
const User = require('../../models/User');
const { sendPasswordResetEmail } = require('../../utils/emailService');

// Controller function to activate, deactivate, or permanently ban a user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive, isBanned } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isBanned === 'boolean') user.isBanned = isBanned;
    await user.save();
    res.json({ message: 'User status updated successfully', isActive: user.isActive, isBanned: user.isBanned });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to elevate or demote a user's role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully', role: user.role });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to forcefully generate and send a password reset email to a user
const forcePasswordReset = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    await sendPasswordResetEmail(user, resetToken);
    res.json({ message: 'Password reset email sent to user' });
  } catch (err) {
    console.error('Force reset error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to fetch security/login logs for a specific user
const getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('loginHistory').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ loginHistory: user.loginHistory || [] });
  } catch (err) {
    console.error('Get login history error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateUserStatus, updateUserRole, forcePasswordReset, getLoginHistory };