import type { RequestHandler } from "express";
import type { ZodType } from "zod";

// Replaces req.body with the parsed (trimmed/normalised) data. A ZodError is formatted
// into a 400 by errorHandler.
export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next): void => {
    req.body = schema.parse(req.body);
    next();
  };
