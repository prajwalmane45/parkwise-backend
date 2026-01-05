const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Example of a protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected profile route',
    user: req.user,
  });
});

module.exports = router;
