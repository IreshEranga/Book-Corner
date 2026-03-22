const crypto = require("crypto");

function requestId(req, res, next) {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);
  next();
}

module.exports = requestId;
