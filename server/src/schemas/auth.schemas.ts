import { z } from "zod";
import { GUEST_EMAIL, GUEST_USERNAME } from "../config/demo.js";

// bcrypt ignores everything after 72 bytes — cap by bytes, not characters.
const MAX_PASSWORD_BYTES = 72;
const byteLength = (s: string): number => new TextEncoder().encode(s).length;

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

// The Guest identity belongs to the demo account. Without this, someone could register it first
// (e.g. before seed:demo runs) and every demo visitor would be logged into their account.
const signupEmail = email.refine((e) => e !== GUEST_EMAIL, "This email address is reserved");
const signupUserName = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username must be at most 30 characters")
  .refine((n) => n.toLowerCase() !== GUEST_USERNAME.toLowerCase(), "This username is reserved");

export const signupSchema = z
  .object({
    userName: signupUserName,
    email: signupEmail,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((p) => byteLength(p) <= MAX_PASSWORD_BYTES, "Password is too long (max 72 bytes)"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Login checks presence only — strength rules belong on signup.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
