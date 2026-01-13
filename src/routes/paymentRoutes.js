const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Dummy payment route (no DB needed)
router.post('/pay', verifyToken, (req, res) => {
  res.json({ message: " payment success" });
});

module.exports = router;
