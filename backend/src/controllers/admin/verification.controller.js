const User = require('../../models/User');
const emailService = require('../../utils/emailService');

// Fetch all users with a 'pending' verification status
const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 'verification.reviewStatus': 'pending' })
      .select('firstName lastName email verification createdAt');  
    res.status(200).json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ success: false, message: 'Server error fetching verifications.' });
  }
};
const updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body; // frontend passes 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }
    const updateData = {
      'verification.reviewStatus': status,
      'verification.verifiedAt': new Date(),
    };    
    if (status === 'approved') {
      updateData['verification.status'] = 'verified';
      updateData['verification.isVerified'] = true;
    } else if (status === 'rejected') {
      updateData['verification.status'] = 'unverified';
      updateData['verification.isVerified'] = false;
      if (rejectionReason) {
        updateData['verification.rejectionReason'] = rejectionReason;
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ); 
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const emailSubject = status === 'approved' 
      ? 'Identity Verification Approved - CarCraze' 
      : 'Identity Verification Rejected - CarCraze';
      
    const emailMessage = status === 'approved'
      ? `<p>Hello ${updatedUser.firstName},</p><p>Great news! Your identity verification has been approved. You can now access all verified features on CarCraze.</p>`
      : `<p>Hello ${updatedUser.firstName},</p><p>Unfortunately, your identity verification was rejected.</p><p><strong>Reason:</strong> ${rejectionReason || 'No specific reason provided.'}</p><p>Please review your details and resubmit your documents.</p>`; 
    try {
      await emailService.sendEmail(updatedUser.email, emailSubject, emailMessage);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
    res.status(200).json({ 
      success: true, 
      message: `User identity successfully ${status}.` 
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
};

// Controller function to manage a seller's verification status
const verifySeller = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['none', 'pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.verification.reviewStatus = status; 
    if (status === 'approved') {
      user.verification.status = 'verified';
      user.verification.isVerified = true;
    } else {
      user.verification.status = 'unverified';
      user.verification.isVerified = false;
    }
    await user.save();   
    if (status === 'approved' || status === 'rejected') {
      const emailSubject = status === 'approved' 
        ? 'Seller Account Approved - CarCraze' 
        : 'Seller Account Verification Rejected - CarCraze';       
      const emailMessage = status === 'approved'
        ? `<p>Hello ${user.firstName},</p><p>Congratulations! Your seller account has been fully verified and approved. You can now start listing your cars.</p>`
        : `<p>Hello ${user.firstName},</p><p>We regret to inform you that your seller account verification was rejected. Please contact support to resolve this issue.</p>`;     
      try {
        await emailService.sendEmail(user.email, emailSubject, emailMessage);
      } catch (emailError) {
        console.error('Failed to send seller verification email:', emailError);
      }
    } 
    res.json({ message: 'Verification status updated', verification: user.verification });
  } catch (err) {
    console.error('Update verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPendingVerifications, updateVerificationStatus, verifySeller };