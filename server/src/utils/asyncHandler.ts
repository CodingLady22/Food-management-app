import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler =
  (fn: AsyncRoute): RequestHandler =>
  (req, res, next): void => {
    fn(req, res, next).catch(next);
  };
