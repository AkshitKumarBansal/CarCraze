const Contact = require('../models/Contact');

// Controller function to handle incoming contact form submissions and save them to the database
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, subject, message).' });
    }
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
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = {
  submitContactForm
};