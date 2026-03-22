const jwt = require("jsonwebtoken");

function authUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing user authorization token" });
  }

  const token = authHeader.slice(7);
  // COLLAB-SAFE: Support USER_JWT_SECRET and fallback JWT_SECRET for cross-service compatibility.
  const userSecret = process.env.USER_JWT_SECRET || process.env.JWT_SECRET;

  if (!userSecret) {
    return res.status(500).json({ message: "User auth secret not configured" });
  }

  try {
    const decoded = jwt.verify(token, userSecret);
    req.user = {
      id: decoded.id || decoded.userId,
      role: decoded.role || "customer",
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid user token payload" });
    }

    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid user authorization token" });
  }
}

module.exports = authUser;
