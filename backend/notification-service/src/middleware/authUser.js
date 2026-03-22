const jwt = require("jsonwebtoken");

function authUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing user authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
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
