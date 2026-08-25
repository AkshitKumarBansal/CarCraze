const User = require('../../models/User');

// Profile retrieval function
const getProfile = async (req, res) => {
  try {
    console.log('Decoded Token User:', req.user);
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
      verification: user.verification,
      ...(user.role === 'seller' && {
        businessInfo: user.businessInfo,
        rating: user.rating
      })
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// Profile update function with role-based checks
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, businessInfo } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        message: 'First name, last name, and phone are required'
      });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    if (user.role === 'seller' && businessInfo) {
      user.businessInfo = businessInfo;
    }
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        verification: user.verification,
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
};

// Controller function to upload and store user verification documents and update verification status
const uploadVerificationDocuments = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const idDocumentUrl = req.files?.idDocument?.[0]?.path;
    const drivingLicenseUrl = req.files?.drivingLicense?.[0]?.path;
    if (!idDocumentUrl || !drivingLicenseUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both an ID Document and a Driving License are required.' 
      });
    } 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'verification.idDocumentUrl': idDocumentUrl,
          'verification.drivingLicenseUrl': drivingLicenseUrl,
          'verification.reviewStatus': 'pending', // Sets the review to pending
          'verification.status': 'unverified',    // Overall status remains unverified until admin approval
          'verification.submittedAt': new Date()
        }
      },
      { new: true, runValidators: true } 
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    } 
    res.status(200).json({
      success: true,
      message: 'Verification documents uploaded successfully.',
      verification: {
        status: updatedUser.verification.status,
        reviewStatus: updatedUser.verification.reviewStatus,
        submittedAt: updatedUser.verification.submittedAt
      }
    });
  } catch (error) {
    console.error('Error uploading verification documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during document upload.',
      error: error.message 
    });
  }
};

module.exports = { getProfile, updateProfile, uploadVerificationDocuments };