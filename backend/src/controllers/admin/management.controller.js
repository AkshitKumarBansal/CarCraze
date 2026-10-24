
const User = require('../../models/User');
const Car = require('../../models/Car');
const Order = require('../../models/Order');
const Rental = require('../../models/Rental');

// Fields that must never be returned in admin user responses.
const SENSITIVE_USER_FIELDS = [
  '-password',
  '-__v',
];

// Get all users.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(SENSITIVE_USER_FIELDS.join(' '))
      .lean();

    return res.status(200).json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// Get a specific user's profile and role-specific history.
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(userId)
      .select(SENSITIVE_USER_FIELDS.join(' '))
      .lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Explicitly expose the new, separate verification objects.
    // Defaults keep the response compatible with older database records.
    const profileData = {
      ...user,

      identityVerification: user.identityVerification || {
        status: 'unverified',
        idDocumentUrl: null,
        drivingLicenseUrl: null,
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        history: [],
      },

      sellerVerification: user.sellerVerification || {
        status: 'not_requested',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        history: [],
      },
    };

    if (user.role === 'seller') {
      const [inventory, sales] = await Promise.all([
        Car.find({ sellerId: user._id }).lean(),
        Order.find({ 'items.car.sellerId': user._id }).lean(),
      ]);

      profileData.sellerData = {
        inventory,
        salesHistory: sales,
      };
    } else if (user.role === 'customer') {
      const [orders, rentals] = await Promise.all([
        Order.find({ customerId: user._id })
          .populate('items.car')
          .lean(),

        Rental.find({ customerId: user._id })
          .populate('carId')
          .lean(),
      ]);

      profileData.customerData = {
        orderHistory: orders,
        rentalHistory: rentals,
      };
    }

    return res.status(200).json({
      user: profileData,
    });
  } catch (err) {
    console.error('Admin get user profile error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// Update permitted user profile fields.
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const ALLOWED_UPDATES = [
      'firstName',
      'lastName',
      'phone',
      'businessInfo',
    ];

    for (const key of ALLOWED_UPDATES) {
      if (
        !Object.prototype.hasOwnProperty.call(req.body, key)
      ) {
        continue;
      }

      if (key === 'businessInfo') {
        const incoming = req.body.businessInfo;

        if (
          !incoming ||
          typeof incoming !== 'object' ||
          Array.isArray(incoming)
        ) {
          return res.status(400).json({
            message: 'businessInfo must be an object',
          });
        }

        user.businessInfo = {
          ...(user.businessInfo?.toObject?.() || user.businessInfo || {}),
          ...incoming,
        };
      } else {
        user[key] = req.body[key];
      }
    }

    await user.save();

    // Exclude credentials and internal version metadata from response.
    const updatedUser = user.toObject();

    delete updatedUser.password;
    delete updatedUser.__v;

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Admin update user error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUser,
};
