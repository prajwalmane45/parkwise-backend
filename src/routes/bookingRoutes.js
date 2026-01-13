const express = require("express");   // ✅ ADD THIS LINE
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking
} = require("../controllers/bookingController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/create", verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);
router.put("/cancel/:id", verifyToken, cancelBooking);

module.exports = router;
