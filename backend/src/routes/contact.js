const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitContactForm); // POST /api/contact

module.exports = router;