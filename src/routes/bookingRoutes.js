const express = require("express");
const router = express.Router();


const {
  createBooking,
  getMyBookings,
  cancelBooking,
  makePayment,
  getAllBookings,
  getRevenueSummary,
} = require("../controllers/bookingController");

const verifyToken = require("../middleware/authMiddleware");

// CREATE BOOKING
router.post("/book", verifyToken, createBooking);

// GET MY BOOKINGS
router.get("/my", verifyToken, getMyBookings);

// GET BOOKING HISTORY
router.get("/history", verifyToken, getAllBookings);

// GET ALL BOOKINGS (admin / testing)
router.get("/all", getAllBookings);

// CANCEL BOOKING
router.put("/cancel/:id", verifyToken, cancelBooking);

// MAKE PAYMENT
router.post("/pay", verifyToken, makePayment);

// REVENUE SUMMARY
router.get("/revenue", getRevenueSummary);

module.exports = router;



