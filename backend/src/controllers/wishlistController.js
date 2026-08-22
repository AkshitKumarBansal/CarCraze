const User = require('../models/User');

// Controller function to retrieve the current user's populated wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'wishlist',
      match: { status: { $ne: 'inactive' } } // exclude inactive cars
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};

// Controller function to toggle a car in or out of the user's wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { carId } = req.params;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const index = user.wishlist.findIndex(id => id.toString() === carId);
    if (index === -1) {
      user.wishlist.push(carId);
      await user.save();
      return res.json({ wishlisted: true, message: 'Added to wishlist' });
    } else {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    }
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist
};