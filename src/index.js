require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- DATABASE -------------------- */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smart_parking_database"
});

db.connect(err => {
  if (err) {
    console.log(" DB connection failed:", err);
  } else {
    console.log(" Connected to MySQL Database");
  }
});

/* -------------------- ROUTES -------------------- */
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const parkingRoutes = require("./routes/parkingRoutes");

// ✅ FIX HERE (MATCH FILE NAME EXACTLY)
const bookingRoutes = require("./routes/bookingRoutes");

const protectedRoutes = require("./routes/protectedRoutes");

/* -------------------- USE ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", protectedRoutes);

/* -------------------- ROOT ROUTE -------------------- */
app.get("/", (req, res) => {
  res.send("Smart Parking Backend is running successfully");
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
