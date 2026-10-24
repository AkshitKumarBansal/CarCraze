
const mongoose = require('mongoose');
const User = require('../../models/User');
const emailService = require('../../utils/emailService');

const MAX_REJECTION_REASON_LENGTH = 500;

const SELLER_STATUS_MAP = {
  none: 'not_requested',
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

// Escape dynamic values before inserting them into HTML emails.
const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[char];
  });

// Validate review input before changing database records.
const validateReviewInput = (status, rejectionReason) => {
  const reason =
    typeof rejectionReason === 'string'
      ? rejectionReason.trim()
      : '';

  if (status === 'rejected' && !reason) {
    return {
      valid: false,
      message: 'A rejection reason is required.',
    };
  }

  if (reason.length > MAX_REJECTION_REASON_LENGTH) {
    return {
      valid: false,
      message: 'Rejection reason cannot exceed 500 characters.',
    };
  }

  return {
    valid: true,
    reason,
  };
};

const getAdminId = (req) => {
  const adminId = req.user?._id || req.user?.id;

  if (
    !adminId ||
    !mongoose.Types.ObjectId.isValid(String(adminId))
  ) {
    return null;
  }

  return adminId;
};

const isValidUserId = (userId) =>
  typeof userId === 'string' &&
  /^[a-fA-F0-9]{24}$/.test(userId);

// Send notification emails without undoing a successful review
// if the email provider is temporarily unavailable.
const sendNotificationEmail = async (email, subject, message) => {
  try {
    await emailService.sendEmail(email, subject, message);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

const getEmailGreeting = (firstName) =>
  escapeHtml(firstName || 'there');

// Fetch users whose identity documents are awaiting review.
const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      'identityVerification.status': 'pending',
    })
      .select(
        'firstName lastName email identityVerification createdAt'
      )
      .lean();

    return res.status(200).json({
      success: true,
      data: pendingUsers,
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching verifications.',
    });
  }
};

// Approve or reject identity verification independently
// of seller-account approval.
const updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body || {};

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.',
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected.',
      });
    }

    const validation = validateReviewInput(
      status,
      rejectionReason
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated administrator ID is missing or invalid.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.identityVerification) {
      return res.status(400).json({
        success: false,
        message: 'Identity verification data is not initialized.',
      });
    }

    const previousStatus = user.identityVerification.status;
    const newStatus =
      status === 'approved' ? 'verified' : 'rejected';

    const reason =
      status === 'rejected' ? validation.reason : null;

    const reviewedAt = new Date();

    user.identityVerification.status = newStatus;
    user.identityVerification.reviewedAt = reviewedAt;
    user.identityVerification.reviewedBy = adminId;
    user.identityVerification.rejectionReason = reason;

    if (!Array.isArray(user.identityVerification.history)) {
      user.identityVerification.history = [];
    }

    user.identityVerification.history.push({
      fromStatus: previousStatus,
      toStatus: newStatus,
      reason,
      adminId,
      changedAt: reviewedAt,
    });

    await user.save();

    const greeting = getEmailGreeting(user.firstName);

    const emailSubject =
      status === 'approved'
        ? 'Identity Verification Approved - CarCraze'
        : 'Identity Verification Rejected - CarCraze';

    const emailMessage =
      status === 'approved'
        ? `<p>Hello ${greeting},</p>
           <p>Your identity verification has been approved.</p>
           <p>You can now access features available to verified users.</p>`
        : `<p>Hello ${greeting},</p>
           <p>Your identity verification was rejected.</p>
           <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
           <p>Please review your details and resubmit your documents.</p>`;

    await sendNotificationEmail(
      user.email,
      emailSubject,
      emailMessage
    );

    return res.status(200).json({
      success: true,
      message: `User identity successfully ${status}.`,
      identityVerification: user.identityVerification,
    });
  } catch (error) {
    console.error('Error updating identity verification:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error updating identity verification.',
    });
  }
};

// Manage seller-account approval independently
// of identity-document verification.
const verifySeller = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body || {};

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.',
      });
    }

    if (!Object.prototype.hasOwnProperty.call(
      SELLER_STATUS_MAP,
      status
    )) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seller verification status.',
      });
    }

    const validation = validateReviewInput(
      status,
      rejectionReason
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated administrator ID is missing or invalid.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'Seller verification can only be updated for seller accounts.',
      });
    }

    if (!user.sellerVerification) {
      return res.status(400).json({
        success: false,
        message: 'Seller verification data is not initialized.',
      });
    }

    const previousStatus = user.sellerVerification.status;
    const newStatus = SELLER_STATUS_MAP[status];
    const isReviewDecision = ['approved', 'rejected'].includes(status);

    const reason =
      status === 'rejected' ? validation.reason : null;

    const changedAt = new Date();

    user.sellerVerification.status = newStatus;
    user.sellerVerification.reviewedAt =
      isReviewDecision ? changedAt : null;
    user.sellerVerification.reviewedBy =
      isReviewDecision ? adminId : null;
    user.sellerVerification.rejectionReason = reason;

    if (!Array.isArray(user.sellerVerification.history)) {
      user.sellerVerification.history = [];
    }

    user.sellerVerification.history.push({
      fromStatus: previousStatus,
      toStatus: newStatus,
      reason,
      adminId,
      changedAt,
    });

    await user.save();

    if (isReviewDecision) {
      const greeting = getEmailGreeting(user.firstName);

      const emailSubject =
        status === 'approved'
          ? 'Seller Account Approved - CarCraze'
          : 'Seller Account Verification Rejected - CarCraze';

      const emailMessage =
        status === 'approved'
          ? `<p>Hello ${greeting},</p>
             <p>Your seller account has been approved.</p>
             <p>You can proceed with the seller features available to your account.</p>`
          : `<p>Hello ${greeting},</p>
             <p>Your seller account verification was rejected.</p>
             <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
             <p>Please address the issue before requesting another review.</p>`;

      await sendNotificationEmail(
        user.email,
        emailSubject,
        emailMessage
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Seller verification status updated.',
      sellerVerification: user.sellerVerification,
    });
  } catch (error) {
    console.error('Error updating seller verification:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error updating seller verification.',
    });
  }
};

// Call the configured external provider to verify a driving licence.
// Replace the placeholder URL with your actual provider endpoint.
const verifyDrivingLicense = async (req, res) => {
  try {
    const { dlNumber, dob } = req.body || {};

    if (
      typeof dlNumber !== 'string' ||
      !dlNumber.trim() ||
      typeof dob !== 'string' ||
      !dob.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Driving licence number and date of birth are required.',
      });
    }

    if (!process.env.KYC_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Driving licence verification is not configured.',
      });
    }

    const kycApiUrl =
      'https://api.your-kyc-provider.com/v1/verification/driving-license';

    let response;

    try {
      response = await fetch(kycApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.KYC_API_KEY}`,
        },
        body: JSON.stringify({
          id_number: dlNumber.trim(),
          dob: dob.trim(),
        }),
      });
    } catch (error) {
      console.error('KYC provider request failed:', error);

      return res.status(502).json({
        success: false,
        message: 'Unable to contact the KYC provider.',
      });
    }

    let data;

    try {
      data = await response.json();
    } catch {
      return res.status(502).json({
        success: false,
        message: 'The KYC provider returned an invalid response.',
      });
    }

    if (!response.ok || data.status_code !== 200) {
      return res.status(502).json({
        success: false,
        message: 'The KYC provider could not verify the driving licence.',
      });
    }

    return res.status(200).json({
      success: true,
      status: data.result?.status,
    });
  } catch (error) {
    console.error('Driving licence verification error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during driving licence verification.',
    });
  }
};

module.exports = {
  getPendingVerifications,
  updateVerificationStatus,
  verifySeller,
  verifyDrivingLicense,
};
