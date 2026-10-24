
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const AdminInvitation = require('../../models/AdminInvitation');

// Prevent sensitive invitation responses from being cached.
const setSensitiveResponseHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-store, private, max-age=0',
    Pragma: 'no-cache',
    'Referrer-Policy': 'no-referrer',
  });
};

// Existing authenticated admin creates an invitation.
const createAdminInvitation = async (req, res) => {
  setSensitiveResponseHeaders(res);

  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Enter a valid email address.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account already exists with this email.',
      });
    }

    // Invalidate previous unused invitations for this email.
    await AdminInvitation.updateMany(
      { email, usedAt: null },
      { $set: { usedAt: new Date() } }
    );

    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const invitation = await AdminInvitation.create({
      email,
      tokenHash,
      invitedBy: req.user.userId,
      expiresAt,
    });

    // Return the raw token only to the authenticated administrator
    // who is creating the invitation. Never log this token or URL.
    return res.status(201).json({
      message: 'Invitation created. It expires in 15 minutes.',
      email,
      token,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    // Do not log invitation tokens, URLs, or request bodies.
    console.error('Create admin invitation failed:', {
      name: error.name,
      code: error.code,
    });

    return res.status(500).json({
      message: 'Could not create the invitation.',
    });
  }
};

// Invitee accepts an invitation and creates an admin account.
const acceptAdminInvitation = async (req, res) => {
  setSensitiveResponseHeaders(res);

  let claimedInvitation = null;

  try {
    // Check configuration before consuming an invitation.
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured.');

      return res.status(500).json({
        message: 'Authentication is not configured.',
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      token,
    } = req.body;

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (
      typeof firstName !== 'string' ||
      !firstName.trim() ||
      typeof lastName !== 'string' ||
      !lastName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      typeof password !== 'string' ||
      !password ||
      typeof phone !== 'string' ||
      !phone.trim() ||
      typeof token !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return res.status(400).json({
        message: 'Provide valid values for all required fields.',
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        message: 'Password must be at least 12 characters long.',
      });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Atomically claim a valid, unused, unexpired invitation.
    // A concurrent request cannot claim the same invitation.
    claimedInvitation = await AdminInvitation.findOneAndUpdate(
      {
        email: normalizedEmail,
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { usedAt: new Date() },
      },
      { new: true }
    );

    if (!claimedInvitation) {
      return res.status(400).json({
        message: 'Invitation is invalid, expired, or already used.',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      // Keep the invitation consumed if this email already has an account.
      claimedInvitation = null;

      return res.status(409).json({
        message: 'An account already exists with this email.',
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
      role: 'admin',
    });

    await user.save();

    // The account now exists, so do not release this invitation,
    // even if a later authentication step fails.
    claimedInvitation = null;

    const authToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Administrator account created successfully.',
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    // Never log the request body, raw token, or invitation URL.
    console.error('Accept admin invitation failed:', {
      name: error.name,
      code: error.code,
    });

    // If account creation failed, attempt to release the claim.
    // Match the exact claim so another request's state is not changed.
    if (claimedInvitation) {
      try {
        await AdminInvitation.updateOne(
          {
            _id: claimedInvitation._id,
            usedAt: claimedInvitation.usedAt,
            expiresAt: { $gt: new Date() },
          },
          { $set: { usedAt: null } }
        );
      } catch (recoveryError) {
        console.error('Could not release claimed invitation:', {
          name: recoveryError.name,
          code: recoveryError.code,
        });
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account or invitation already exists for this email.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Please check the submitted account details.',
      });
    }

    return res.status(500).json({
      message: 'Could not complete administrator registration.',
    });
  }
};

module.exports = {
  createAdminInvitation,
  acceptAdminInvitation,
};