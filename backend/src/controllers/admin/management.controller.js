const User = require('../../models/User');
const Car = require('../../models/Car');
const Order = require('../../models/Order');
const Rental = require('../../models/Rental');

// Controller function to get a list of all users in the system
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to retrieve a comprehensive profile for a specific user, including role-specific history
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let profileData = { ...user };
    if (user.role === 'seller') {
      const inventory = await Car.find({ sellerId: user._id }).lean();
      const sales = await Order.find({ 'items.car.sellerId': user._id }).lean(); 
      profileData.sellerData = {
        inventory,
        salesHistory: sales,
      };
    } else if (user.role === 'customer') {
      const orders = await Order.find({ customerId: user._id }).populate('items.car').lean();
      const rentals = await Rental.find({ customerId: user._id }).populate('carId').lean();
      profileData.customerData = {
        orderHistory: orders,
        rentalHistory: rentals,
      };
    }
    res.json({ user: profileData });
  } catch (err) {
    console.error('Admin get user profile error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to process a general profile update for a user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ALLOWED_UPDATES = ['firstName', 'lastName', 'phone', 'businessInfo'];
    Object.keys(req.body).forEach(key => {
      if (ALLOWED_UPDATES.includes(key)) {
        if (key === 'businessInfo' && typeof req.body[key] === 'object') {
            user.businessInfo = { ...user.businessInfo, ...req.body[key] };
        } else {
            user[key] = req.body[key];
        }
      }
    });
    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllUsers, getUserProfile, updateUser };