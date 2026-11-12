import MongoStore from "connect-mongo";
import type { RequestHandler } from "express";
import session from "express-session";
import mongoose from "mongoose";
import { env } from "./env.js";

export const SESSION_COOKIE = "connect.sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Must be called after connectDB(): the store reuses Mongoose's existing connection.
export const createSessionMiddleware = (): RequestHandler =>
  session({
    name: SESSION_COOKIE,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // no session (and no cookie) until someone logs in
    rolling: true, // each request pushes expiry out, so active users aren't logged out mid-session
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: mongoose.connection.name,
      ttl: SESSION_TTL_MS / 1000,
      touchAfter: 60 * 60, // don't rewrite an unchanged session more than once an hour
    }),
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_MS,
    },
  });
