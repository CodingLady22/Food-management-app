import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/health", (_req, res): void => {
  res.json({ ok: true });
});
