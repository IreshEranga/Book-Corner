require("dotenv").config();

const app = require("./app");
const { connectDb } = require("./config/db");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT || 3004);

async function startServer() {
  try {
    if (!process.env.INTERNAL_JWT_SECRET || !process.env.USER_JWT_SECRET) {
      throw new Error("INTERNAL_JWT_SECRET and USER_JWT_SECRET are required");
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
