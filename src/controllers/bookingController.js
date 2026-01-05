const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smart_parking_database",
});

db.connect(err => {
  if (err) console.log("DB Error:", err);
  else console.log("DB Connected");
});

// ================= CREATE BOOKING =================
const createBooking = (req, res) => {
  try {
    const {
      parkingId,
      vehicleNumber,
      vehicleType,
      entryTime,
      exitTime,
    } = req.body;

    const userId = req.user.id;

    if (!parkingId || !vehicleNumber || !vehicleType || !entryTime || !exitTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const startDateTime = new Date(entryTime);
    const endDateTime = new Date(exitTime);

    if (
      isNaN(startDateTime.getTime()) ||
      isNaN(endDateTime.getTime())
    ) {
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

    db.query(
      "SELECT * FROM parking_lots WHERE id = ?",
      [parkingId],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0)
          return res.status(404).json({ message: "Parking lot not found" });

        const lot = results[0];

        if (vehicleType === "2W" && lot.available2W <= 0)
          return res.status(400).json({ message: "No 2W slots available" });

        if (vehicleType === "4W" && lot.available4W <= 0)
          return res.status(400).json({ message: "No 4W slots available" });

        const slotColumn =
          vehicleType === "2W" ? "available2W" : "available4W";

        db.query(
          `UPDATE parking_lots SET ${slotColumn} = ${slotColumn} - 1 WHERE id = ?`,
          [parkingId],
          err2 => {
            if (err2)
              return res.status(500).json({ message: "Slot update failed" });

            db.query(
              `INSERT INTO booking
              (User_ID, Parking_Lot_ID, Vehicle_No, Vehicle_Type, Start_Time, End_Time, Amount, Payment_Status, Paid)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                parkingId,
                vehicleNumber,
                vehicleType,
                startDateTime,
                endDateTime,
                amount,
                "Paid",
                "Yes",
              ],
              (err3, result) => {
                if (err3)
                  return res.status(500).json({ message: "Booking failed" });

                res.status(201).json({
                  message: "Booking successful",
                  bookingId: result.insertId,
                  amount,
                  hours,
                });
              }
            );
          }
        );
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MY BOOKINGS =================

const getMyBookings = (req, res) => {
  db.query(
    `SELECT b.*, p.name AS Parking_Name
     FROM booking b
     JOIN parking_lots p ON b.Parking_Lot_ID = p.id
     WHERE b.User_ID = ?
     ORDER BY b.Booking_ID DESC`,
    [req.user.id],
    (err, results) => {
      if (err) {
        console.log("DB error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};


// ================= GET ALL BOOKINGS =================
const getAllBookings = (req, res) => {
  db.query("SELECT * FROM booking", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
};


// ================= CANCEL BOOKING =================
const cancelBooking = (req, res) => {
  const bookingId = req.params.id;

  db.query(
    "SELECT * FROM booking WHERE Booking_ID = ?",
    [bookingId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Booking not found" });

      const booking = results[0];

      //  restore slot
      const slotColumn =
        booking.Vehicle_Type === "2W" ? "available2W" : "available4W";

      db.query(
        `UPDATE parking_lots SET ${slotColumn} = ${slotColumn} + 1 WHERE id = ?`,
        [booking.Parking_Lot_ID]
      );

      //  80% refund
      const refundAmount = booking.Amount * 0.8;

      //  update booking
      db.query(
        `UPDATE booking
         SET 
           Payment_Status = 'Cancelled',
           Paid = 'No',
           Refund_Amount = ?,
           Cancellation_Time = NOW()
         WHERE Booking_ID = ?`,
        [refundAmount, bookingId],
        err2 => {
          if (err2)
            return res.status(500).json({ message: "Cancel failed" });

          res.json({
            message: "Booking cancelled",
            refundAmount,
          });
        }
      );
    }
  );
};


// ================= PAYMENT & REVENUE =================
const makePayment = (req, res) => {
  res.json({ message: "Dummy payment success" });
};

const getRevenueSummary = (req, res) => {
  db.query(
    "SELECT SUM(Amount) AS totalRevenue FROM booking WHERE Payment_Status='Paid'",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(results[0]);
    }
  );
};

// ================= BOOKING HISTORY (ALL) =================
const getBookingHistory = (req, res) => {
  db.query(
    `SELECT 
       b.*,
       p.name AS Parking_Name
     FROM booking b
     JOIN parking_lots p ON b.Parking_Lot_ID = p.id
     WHERE b.User_ID = ?
     ORDER BY b.Start_Time DESC`,
    [req.user.id],
    (err, results) => {
      if (err) {
        console.log("History DB error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};


module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  makePayment,
  getRevenueSummary,
  getBookingHistory,
};

