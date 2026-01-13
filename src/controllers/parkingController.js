const db = require("../config/db");

// ADD PARKING LOT (ADMIN)
const addParkingLot = (req, res) => {
  const { name, location, total2W, total4W } = req.body;

  if (!name || !location || total2W == null || total4W == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO parking_lots
    (name, location, total2w, total4w, available2w, available4w)
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

// GET ALL PARKING LOTS
const getAllParkingLots = (req, res) => {
  db.query("SELECT * FROM parking_lots", (err, rows) => {
    if (err) {
      console.error("Fetch parking error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
};

// UPDATE PARKING LOT
const updateParkingLot = (req, res) => {
  const { id } = req.params;
  const { name, location, total2W, total4W } = req.body;

  const sql = `
    UPDATE parking_lots
    SET name=?, location=?, total2w=?, total4w=?
    WHERE id=?
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

// DELETE PARKING LOT
const deleteParkingLot = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM parking_lots WHERE id=?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Delete parking error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Parking lot not found" });
      }

      res.json({ message: "Parking lot deleted successfully" });
    }
  );
};

module.exports = {
  addParkingLot,
  getAllParkingLots,
  updateParkingLot,
  deleteParkingLot,
};
