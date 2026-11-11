import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler: RequestHandler = (_req, res): void => {
  res.status(404).json({ error: "Not found" });
};

// Only place that formats error responses. Must be registered last.
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next): void => {
  if (err instanceof ZodError) {
    const fields = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    res.status(400).json({ error: "Validation failed", fields });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error("Unhandled error", { message: err instanceof Error ? err.message : "unknown" });
  res.status(500).json({ error: "Something went wrong" });
};
