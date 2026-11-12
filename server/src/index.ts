import express from "express";
import passport from "passport";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { configurePassport } from "./config/passport.js";
import { createSessionMiddleware } from "./config/session.js";
import { authRoutes } from "./routes/auth.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const start = async (): Promise<void> => {
  await connectDB(); // the session store reuses this connection, so the app is built after it

  const app = express();

  // One proxy hop (Render's load balancer): makes req.ip the real client IP and lets
  // the secure session cookie work in production. Not `true` — that would trust spoofed headers.
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(createSessionMiddleware());
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api", notFoundHandler);

  // Static serving of client/dist + SPA fallback arrive in feature 15; cron in feature 14.

  app.use(errorHandler);

  app.listen(env.PORT, () => {
    logger.info("Server listening", { port: env.PORT });
  });
};

start().catch((err: unknown) => {
  logger.error("Failed to start server", { message: err instanceof Error ? err.message : "unknown" });
  process.exit(1);
});
