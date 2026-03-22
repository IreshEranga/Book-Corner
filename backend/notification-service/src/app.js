const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const requestId = require("./middleware/requestId");
const errorHandler = require("./middleware/errorHandler");

const eventsRouter = require("./routes/events");
const notificationsRouter = require("./routes/notifications");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(morgan("combined"));
app.use(requestId);

app.get("/health", (req, res) => {
  res.status(200).json({
    service: "notification-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/events", eventsRouter);
app.use("/api/notifications", notificationsRouter);

app.use(errorHandler);

module.exports = app;
