const express = require("express");
const rateLimit = require("express-rate-limit");
const authService = require("../middleware/authService");
const { validateEventPayload } = require("../validators/eventValidator");
const { processEvent } = require("../services/notificationService");

const router = express.Router();

const eventRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", authService, eventRateLimiter, async (req, res, next) => {
  try {
    const validation = validateEventPayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        message: "Invalid payload",
        details: validation.errors,
      });
    }

    const deliveries = await processEvent(validation.data, req.correlationId);

    return res.status(202).json({
      message: "Event accepted",
      deliveries,
      correlationId: req.correlationId,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
