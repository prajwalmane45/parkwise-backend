const express = require('express');
const router = express.Router();
const { makePayment } = require('../controllers/bookingController');
const verifyToken = require('../middleware/authMiddleware');

// Dummy payment route
router.post('/pay', verifyToken, makePayment);

module.exports = router;
