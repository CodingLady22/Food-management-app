import { Router } from "express";
import { demo, login, logout, me, signup } from "../controllers/auth.controller.js";
import { demoLimiter, loginPerEmailLimiter, loginPerIpLimiter, signupLimiter } from "../middleware/rateLimiters.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, signupSchema } from "../schemas/auth.schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/signup", signupLimiter, validateBody(signupSchema), asyncHandler(signup));
// Per-IP limiter goes BEFORE validation so malformed requests are throttled too (it doesn't need the
// email). The per-email limiter needs the normalised email, so it stays AFTER validation.
authRoutes.post(
  "/login",
  loginPerIpLimiter,
  validateBody(loginSchema),
  loginPerEmailLimiter,
  asyncHandler(login),
);
authRoutes.post("/logout", asyncHandler(logout));
authRoutes.post("/demo", demoLimiter, asyncHandler(demo));
authRoutes.get("/me", requireAuth, me);
