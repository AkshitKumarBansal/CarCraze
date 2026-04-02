const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, subject, message).' });
    }

    // Save to MongoDB
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });
    await newContact.save();

    res.status(200).json({ message: 'Thank you for your message! We\'ll get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    // Send the actual error message back to the frontend for easier debugging
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
});

module.exports = router;
