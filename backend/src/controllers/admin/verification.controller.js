const User = require('../../models/User');

// Fetch all users with a 'pending' verification status
const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 'verification.status': 'pending' })
      .select('firstName lastName email verification createdAt');
      
    res.status(200).json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ success: false, message: 'Server error fetching verifications.' });
  }
};

// Update a user's verification status (Approve or Reject)
const updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }
    const updateData = {
      'verification.status': status,
      'verification.verifiedAt': new Date(),
    };
    if (status === 'rejected' && rejectionReason) {
      updateData['verification.rejectionReason'] = rejectionReason;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
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
    if (!['unverified', 'pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.verification.status = status;
    if (status === 'approved') user.verification.isVerified = true;
    else user.verification.isVerified = false;
    await user.save();
    res.json({ message: 'Verification status updated', verification: user.verification });
  } catch (err) {
    console.error('Update verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPendingVerifications, updateVerificationStatus, verifySeller };