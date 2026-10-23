
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const AdminInvitation = require('../../models/AdminInvitation');

// Existing authenticated admin creates an invitation.
const createAdminInvitation = async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Enter a valid email address.'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account already exists with this email.'
      });
    }

    // Invalidate any older unused invitations for this email.
    await AdminInvitation.updateMany(
      { email, usedAt: null },
      { $set: { usedAt: new Date() } }
    );

    // Generate a cryptographically secure, unguessable token.
    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await AdminInvitation.create({
      email,
      tokenHash,
      invitedBy: req.user.userId,
      expiresAt
    });

    // Return the raw token only once.
    // Deliver it privately; never log it or store it in frontend code.
    return res.status(201).json({
      message: 'Invitation created. It expires in 15 minutes.',
      email,
      token,
      expiresAt
    });
  } catch (error) {
    console.error('Create admin invitation failed:', error);

    return res.status(500).json({
      message: 'Could not create the invitation.'
    });
  }
};


// Invitee accepts an invitation and creates an admin account.
const acceptAdminInvitation = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      token
    } = req.body;

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !normalizedEmail ||
      !password ||
      !phone ||
      typeof token !== 'string' ||
      token.length !== 64
    ) {
      return res.status(400).json({
        message: 'Provide all required fields and a valid invitation token.'
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        message: 'Password must be at least 12 characters long.'
      });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Atomically claim the invitation. Only one request can claim it.
    const invitation = await AdminInvitation.findOneAndUpdate(
      {
        email: normalizedEmail,
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: { usedAt: new Date() }
      },
      { new: true }
    );

    if (!invitation) {
      return res.status(400).json({
        message: 'Invitation is invalid, expired, or already used.'
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account already exists with this email. Request a new invitation if needed.'
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
      role: 'admin'
    });

    // Your User model hashes the password in its pre-save hook.
    await user.save();

    // Match the existing CarCraze authentication response.
    const authToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: 'Administrator account created successfully.',
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Accept admin invitation failed:', error);

    return res.status(500).json({
      message: 'Could not complete administrator registration.'
    });
  }
};

module.exports = {
  createAdminInvitation,
  acceptAdminInvitation
};