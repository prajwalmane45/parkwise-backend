require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- DATABASE -------------------- */
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ PostgreSQL connection error:", err));

module.exports = pool;


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
