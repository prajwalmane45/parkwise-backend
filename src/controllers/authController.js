const pool = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const role = email === "admin@smartparking.com" ? "admin" : "user";

  await pool.query(
    "INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)",
    [name, email, hashedPassword, role]
  );

  res.status(201).json({ message: "User registered successfully" });
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ message: "Invalid email or password" });

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(400).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};

module.exports = { registerUser, loginUser };
