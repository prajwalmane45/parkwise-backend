const express = require("express");
const router = express.Router();
const { registerUser, loginUser}=require("../controllers/authController");

router.post('/register',registerUser);

router.post('/login', loginUser);

const verifyToken = require("../middleware/authMiddleware");

router.get("/me", verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
});

module.exports = router;