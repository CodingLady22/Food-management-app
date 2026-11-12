import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// NOTE: these use express-rate-limit's default in-memory store, which assumes a SINGLE
// server instance (one Render dynamic). If the app ever scales out, counters would be
// per-instance — swap in a shared (Mongo-backed) store. Counters also reset on restart.
// Relies on app.set("trust proxy", 1) so req.ip is the real client, not Render's proxy.

const tooMany = { error: "Too many attempts. Please try again later." };

const base = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
} as const;

const clientIp = (req: Request): string => ipKeyGenerator(req.ip ?? "");

// Run AFTER validateBody so the email in the key is already trimmed + lowercased.
// Only failed logins count, so a legitimate user logging in correctly never burns attempts.
export const loginPerEmailLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  // Safe cast: validateBody(loginSchema) runs first, so req.body.email is a trimmed, lowercased string.
  // `unknown` + String() keeps this from throwing if the route is ever wired without validation.
  keyGenerator: (req): string => `${clientIp(req)}:${String((req.body as { email?: unknown }).email)}`,
});

// Catches one IP cycling through many emails, which the per-email key alone wouldn't stop.
export const loginPerIpLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  keyGenerator: clientIp,
});

export const signupLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: clientIp,
});

export const demoLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: clientIp,
});
