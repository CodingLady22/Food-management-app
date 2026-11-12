import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import { SESSION_COOKIE } from "../config/session.js";
import type { SignupInput } from "../schemas/auth.schemas.js";
import { createUser, findDemoUser, toPublicUser } from "../services/auth.service.js";
import type { PublicUser } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

// req.login / req.logout / session.destroy are callback-based; wrap once here.
const logIn = (req: Request, user: PublicUser): Promise<void> =>
  new Promise((resolve, reject) => {
    req.login(user, (err) => (err ? reject(err) : resolve())); // passport regenerates the session id
  });

const logOut = (req: Request): Promise<void> =>
  new Promise((resolve, reject) => {
    req.logout((err) => {
      if (err) return reject(err);
      req.session.destroy((destroyErr) => (destroyErr ? reject(destroyErr) : resolve()));
    });
  });

const authenticateLocal = (req: Request, res: Response, next: NextFunction): Promise<PublicUser | false> =>
  new Promise((resolve, reject) => {
    passport.authenticate("local", (err: unknown, user: PublicUser | false) => {
      if (err) return reject(err);
      resolve(user);
    })(req, res, next);
  });

export const signup = async (req: Request, res: Response): Promise<void> => {
  // Safe cast: validateBody(signupSchema) runs before this handler and replaced req.body with the parsed data.
  const { userName, email, password } = req.body as SignupInput;
  const user = toPublicUser(await createUser({ userName, email, password }));
  await logIn(req, user);
  res.status(201).json({ user });
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await authenticateLocal(req, res, next);
  // Same message for unknown email and wrong password — don't reveal which emails exist.
  if (!user) throw new HttpError(401, "Invalid email or password");
  await logIn(req, user);
  res.json({ user });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await logOut(req);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
};

export const demo = async (req: Request, res: Response): Promise<void> => {
  const guest = await findDemoUser();
  if (!guest) throw new HttpError(503, "Demo is not available right now");
  const user = toPublicUser(guest);
  await logIn(req, user);
  res.json({ user });
};

export const me = (req: Request, res: Response): void => {
  res.json({ user: req.user });
};
