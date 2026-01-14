const db = require("../config/db");

// ADD PARKING LOT (ADMIN)
const addParkingLot = async (req, res) => {
  const { name, location, total2W, total4W } = req.body;

  if (!name || !location || total2W == null || total4W == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO parking_lots
       (name, location, total2W, total4W, available2W, available4W)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, location, total2W, total4W, total2W, total4W]
    );

    res.status(201).json({
      message: "Parking lot added successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Add parking error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// GET ALL PARKING LOTS
const getAllParkingLots = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM parking_lots");
    res.json(rows);
  } catch (err) {
    console.error("Fetch parking error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// UPDATE PARKING LOT (ADMIN)
const updateParkingLot = async (req, res) => {
  const { id } = req.params;
  const { name, location, total2W, total4W } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE parking_lots
       SET name = ?, location = ?, total2W = ?, total4W = ?
       WHERE id = ?`,
      [name, location, total2W, total4W, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    res.json({ message: "Parking lot updated successfully" });
  } catch (err) {
    console.error("Update parking error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// DELETE PARKING LOT (ADMIN)
const deleteParkingLot = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM parking_lots WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    res.json({ message: "Parking lot deleted successfully" });
  } catch (err) {
    console.error("Delete parking error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = {
  addParkingLot,
  getAllParkingLots,
  updateParkingLot,
  deleteParkingLot,
};
