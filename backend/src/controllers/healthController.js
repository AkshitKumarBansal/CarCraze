const mongoose = require('mongoose');

// Controller function to check server and database health
const checkHealth = async (_req, res) => {
  try {
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
};

module.exports = { checkHealth };