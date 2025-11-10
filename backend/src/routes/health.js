const express = require('express');
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    // Test MongoDB connection
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({ 
      status: 'OK', 
      message: 'CarCraze Server is running!',
      database: isConnected ? 'Connected to MongoDB' : 'Not connected to MongoDB'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    });
  }
});

module.exports = router;