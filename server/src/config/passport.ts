import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { findUserById, toPublicUser, verifyCredentials } from "../services/auth.service.js";
import type { PublicUser } from "../types/api.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // What req.user looks like everywhere — never includes the password hash.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends PublicUser {}
  }
}

export const configurePassport = (): void => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done): void => {
      verifyCredentials(email, password)
        .then((user) => done(null, user ? toPublicUser(user) : false))
        .catch((err: unknown) => done(err));
    }),
  );

  // Only the user id lives in the session; the user is re-loaded from the DB on each request.
  passport.serializeUser((user, done): void => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done): void => {
    findUserById(id)
      .then((user) => done(null, user ? toPublicUser(user) : false))
      .catch((err: unknown) => done(err));
  });
};
