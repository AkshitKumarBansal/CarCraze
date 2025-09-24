const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'CarCraze Server is running!' });
});

module.exports = router;