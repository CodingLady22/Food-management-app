import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected", { host: conn.connection.host });
};
