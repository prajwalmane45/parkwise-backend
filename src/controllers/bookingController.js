const db = require("../config/db");

// ================= CREATE BOOKING =================
const createBooking = async (req, res) => {
  try {
    const { parkingId, vehicleNumber, vehicleType, entryTime, exitTime } =
      req.body;

    const userId = req.user.id;

    if (!parkingId || !vehicleNumber || !vehicleType || !entryTime || !exitTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const startDateTime = new Date(entryTime);
    const endDateTime = new Date(exitTime);

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        message: "Exit time must be after entry time",
      });
    }

    const diffMs = endDateTime - startDateTime;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const ratePerHour = vehicleType === "2W" ? 10 : 40;
    const amount = hours * ratePerHour;

    // 🔹 Get parking lot
    const [parkingRows] = await db.query(
      "SELECT * FROM parking_lots WHERE id = ?",
      [parkingId]
    );

    if (parkingRows.length === 0) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    const lot = parkingRows[0];

    if (vehicleType === "2W" && lot.available2w <= 0) {
      return res.status(400).json({ message: "No 2W slots available" });
    }

    if (vehicleType === "4W" && lot.available4w <= 0) {
      return res.status(400).json({ message: "No 4W slots available" });
    }

    const slotColumn =
      vehicleType === "2W" ? "available2w" : "available4w";

    // 🔹 Update slot count
    await db.query(
      `UPDATE parking_lots SET ${slotColumn} = ${slotColumn} - 1 WHERE id = ?`,
      [parkingId]
    );

    // 🔹 Insert booking
    const [result] = await db.query(
      `INSERT INTO booking
      (user_id, parking_lot_id, vehicle_no, vehicle_type, start_time, end_time, amount, payment_status, paid)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Paid', 'Yes')`,
      [
        userId,
        parkingId,
        vehicleNumber,
        vehicleType,
        startDateTime,
        endDateTime,
        amount,
      ]
    );

    res.status(201).json({
      message: "Booking successful",
      bookingId: result.insertId,
      amount,
      hours,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MY BOOKINGS =================
const getMyBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, p.name AS parking_name
       FROM booking b
       JOIN parking_lots p ON b.parking_lot_id = p.id
       WHERE b.user_id = ?
       ORDER BY b.booking_id DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// ================= CANCEL BOOKING =================
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = rows[0];
    const slotColumn =
      booking.vehicle_type === "2W" ? "available2w" : "available4w";

    // restore slot
    await db.query(
      `UPDATE parking_lots SET ${slotColumn} = ${slotColumn} + 1 WHERE id = ?`,
      [booking.parking_lot_id]
    );

    const refundAmount = booking.amount * 0.8;

    await db.query(
      `UPDATE booking
       SET payment_status = 'Cancelled',
           paid = 'No',
           refund_amount = ?,
           cancellation_time = NOW()
       WHERE booking_id = ?`,
      [refundAmount, bookingId]
    );

    res.json({
      message: "Booking cancelled",
      refundAmount,
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
