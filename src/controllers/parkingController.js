// src/controllers/parkingController.js
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smart_parking_database"
});

db.connect(err => {
  if (err) console.log(":", err);
  else console.log("");
});

module.exports = db;


// ADD PARKING LOT (ADMIN)
const addParkingLot = (req, res) => {
  const { name, location, total2W, total4W } = req.body;

  if (!name || !location || total2W == null || total4W == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO parking_lots 
    (name, location, total2W, total4W, available2W, available4W)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, location, total2W, total4W, total2W, total4W],
    (err, result) => {
      if (err) {
        console.error("Add parking error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        message: "Parking lot added successfully",
        id: result.insertId,
      });
    }
  );
};

// ✅ GET ALL PARKING LOTS (THIS FIXES YOUR HOME SCREEN)
const getAllParkingLots = (req, res) => {
  const sql = "SELECT * FROM parking_lots";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch parking error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result); // 🔥 THIS MAKES CARDS APPEAR AGAIN
  });
};

// UPDATE PARKING LOT (ADMIN)
const updateParkingLot = (req, res) => {
  const { id } = req.params;
  const { name, location, total2W, total4W } = req.body;

  const sql = `
    UPDATE parking_lots 
    SET name = ?, location = ?, total2W = ?, total4W = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, location, total2W, total4W, id],
    (err, result) => {
      if (err) {
        console.error("Update parking error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Parking lot not found" });
      }

      res.json({ message: "Parking lot updated successfully" });
    }
  );
};

// DELETE PARKING LOT (ADMIN)
const deleteParkingLot = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM parking_lots WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Delete parking error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    res.json({ message: "Parking lot deleted successfully" });
  });
};

module.exports = {
  addParkingLot,
  getAllParkingLots,
  updateParkingLot,
  deleteParkingLot,
};
