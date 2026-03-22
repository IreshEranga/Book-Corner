const jwt = require("jsonwebtoken");

function authService(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing service authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.INTERNAL_JWT_SECRET);
    req.service = {
      name: decoded.service || "unknown-service",
      scope: decoded.scope || "internal",
    };
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid service authorization token" });
  }
}

module.exports = authService;
