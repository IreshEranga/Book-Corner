require("dotenv").config();

const app = require("./app");
const { connectDb } = require("./config/db");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT || 3004);

async function startServer() {
  try {
    // COLLAB-SAFE: Support either internal JWT secret or shared service token.
    if (
      !process.env.INTERNAL_JWT_SECRET &&
      !process.env.INTERNAL_SERVICE_TOKEN
    ) {
      throw new Error(
        "Either INTERNAL_JWT_SECRET or INTERNAL_SERVICE_TOKEN must be configured",
      );
    }

    // COLLAB-SAFE: Support USER_JWT_SECRET with JWT_SECRET fallback.
    if (!process.env.USER_JWT_SECRET && !process.env.JWT_SECRET) {
      throw new Error(
        "Either USER_JWT_SECRET or JWT_SECRET must be configured",
      );
    }

    await connectDb();

    app.listen(PORT, () => {
      logger.info("Notification service started", { port: PORT });
    });
  } catch (error) {
    logger.error("Failed to start notification service", {
      error: error.message,
    });
    process.exit(1);
  }
}

startServer();
