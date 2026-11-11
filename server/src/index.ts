import express from "express";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { healthRoutes } from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", notFoundHandler);

// Static serving of client/dist + SPA fallback arrive in feature 15; cron in feature 14.

app.use(errorHandler);

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info("Server listening", { port: env.PORT });
  });
};

start().catch((err: unknown) => {
  logger.error("Failed to start server", { message: err instanceof Error ? err.message : "unknown" });
  process.exit(1);
});
