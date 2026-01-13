const pool = require("../config/db");

// ADD PARKING LOT (ADMIN)
const addParkingLot = async (req, res) => {
  const { name, location, total2W, total4W } = req.body;

  if (!name || !location || total2W == null || total4W == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = `
      INSERT INTO parking_lots
      (name, location, total2w, total4w, available2w, available4w)
      VALUES ($1, $2, $3, $4, $3, $4)
      RETURNING id
    `;

    const result = await pool.query(query, [
      name,
      location,
      total2W,
      total4W,
    ]);

    res.status(201).json({
      message: "Parking lot added successfully",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Add parking error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// GET ALL PARKING LOTS
const getAllParkingLots = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parking_lots");
    res.json(result.rows);
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
    const query = `
      UPDATE parking_lots
      SET name=$1, location=$2, total2w=$3, total4w=$4
      WHERE id=$5
    `;

    const result = await pool.query(query, [
      name,
      location,
      total2W,
      total4W,
      id,
    ]);

    if (result.rowCount === 0) {
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
    const result = await pool.query(
      "DELETE FROM parking_lots WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
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
