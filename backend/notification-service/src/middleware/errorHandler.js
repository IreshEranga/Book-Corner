const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error("Unhandled request error", {
    correlationId: req.correlationId,
    path: req.path,
    method: req.method,
    error: err.message,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: "Internal server error",
    correlationId: req.correlationId,
  });
}

module.exports = errorHandler;
