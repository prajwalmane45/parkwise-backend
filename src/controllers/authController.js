const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smart_parking_database"
});

db.connect(err => {
  if (err) console.log(" Database connection failed:", err);
  else console.log(" Connected to MySQL Database");
});





// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = email === "admin@smartparking.com" ? "admin" : "user";

        db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, role],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Failed to register user" });
            }

            return res.status(201).json({
              message: "User registered successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= LOGIN USER =================
const loginUser = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("JWT_SECRET in authController:", process.env.JWT_SECRET); // Debug statement

    const token = jwt.sign(
  {
    id: user.id,        // ✅ THIS WAS MISSING
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET || "defaultsecret",
  { expiresIn: "1d" }
);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};

module.exports = { registerUser, loginUser };
