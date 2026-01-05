const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No Authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res.status(401).json({
        message: "Invalid auth header format. Use: Bearer <token>",
      });
    }

    const [scheme, token] = parts;

    if (scheme !== "Bearer") {
      return res.status(401).json({ message: "Malformed token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret"
    );

    // ✅ VERY IMPORTANT
    req.user = {
      id: decoded.id,       // make sure id exists
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
