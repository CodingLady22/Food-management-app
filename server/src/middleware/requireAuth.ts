import type { RequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";

// Guard for every route that needs a logged-in user. Services still filter by ownership.
export const requireAuth: RequestHandler = (req, _res, next): void => {
  if (!req.isAuthenticated()) {
    next(new HttpError(401, "Not authenticated"));
    return;
  }
  next();
};
