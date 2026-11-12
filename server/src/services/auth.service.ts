import bcrypt from "bcryptjs";
import { GUEST_EMAIL } from "../config/demo.js";
import { BCRYPT_COST, USERNAME_COLLATION, User, type UserDocument } from "../models/User.js";
import type { SignupInput } from "../schemas/auth.schemas.js";
import type { PublicUser } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

export const toPublicUser = (u: UserDocument): PublicUser => ({
  // Mongoose types the `id` virtual as `any`; it is always the string form of _id.
  id: u.id as string,
  userName: u.userName,
  email: u.email,
});

// Compared against when the email is unknown, so "no such user" and "wrong password"
// cost the same time and can't be told apart by timing. Computed lazily on first use (not at
// import) at the same cost as real hashes, so importing this module stays cheap and can't drift.
let dummyHash: Promise<string> | undefined;
const getDummyHash = (): Promise<string> => (dummyHash ??= bcrypt.hash("timing-equaliser", BCRYPT_COST));

// Type guard for the driver's duplicate-key error (MongoServerError, code 11000).
// The cast only reads `code` off an already-narrowed object so it can be compared; nothing else is trusted.
const isDuplicateKeyError = (err: unknown): err is { code: number; keyPattern?: Record<string, unknown> } =>
  typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000;

export const createUser = async (input: Pick<SignupInput, "userName" | "email" | "password">): Promise<UserDocument> => {
  // Two queries, not one $or: the username lookup needs the case-insensitive collation to use its
  // index, and applying that collation to the email branch would turn it into a collection scan.
  const [emailTaken, userNameTaken] = await Promise.all([
    User.exists({ email: input.email }),
    User.exists({ userName: input.userName }).collation(USERNAME_COLLATION),
  ]);
  if (emailTaken) throw new HttpError(409, "Email is already in use");
  if (userNameTaken) throw new HttpError(409, "Username is already taken");
  try {
    return await User.create(input);
  } catch (err) {
    // Two signups racing past the check above — the unique indexes are the backstop.
    if (isDuplicateKeyError(err)) {
      throw new HttpError(409, err.keyPattern && "userName" in err.keyPattern ? "Username is already taken" : "Email is already in use");
    }
    throw err;
  }
};

// Returns the user on success, null for unknown email OR wrong password (same outcome on purpose).
export const verifyCredentials = async (email: string, password: string): Promise<UserDocument | null> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    await bcrypt.compare(password, await getDummyHash());
    return null;
  }
  return (await user.comparePassword(password)) ? user : null;
};

export const findUserById = (id: string): Promise<UserDocument | null> => User.findById(id);

// The one place the Guest user is looked up (by email, not DEMO_USER_ID). Feature 14's cron reuses this.
export const findDemoUser = (): Promise<UserDocument | null> => User.findOne({ email: GUEST_EMAIL });
