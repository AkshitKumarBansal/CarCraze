const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const upload = require('../middleware/multer');

// Import from the new user controllers folder
const { 
    getProfile, 
    updateProfile, 
    uploadVerificationDocuments 
} = require('../controllers/user');

const router = express.Router();

// Base route: /api/users
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

router.post('/verify-identity', authenticateToken, (req, res, next) => {
  const uploadMiddleware = upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 }
  ]);
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("🔥 MULTER UPLOAD ERROR:", err); 
      return res.status(500).json({ 
        success: false, 
        message: 'File upload failed', 
        error: err.message 
      });
    }
    next();
  });
}, uploadVerificationDocuments);

module.exports = router;