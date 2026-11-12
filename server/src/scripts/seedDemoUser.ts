// One-off, idempotent: creates the shared Guest user and prints its id.
// Run: npm run seed:demo -w server
// Uses its own minimal env on purpose (only MONGODB_URI) — it must run before
// DEMO_USER_ID exists, so it can't import the full config/env.ts.
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const GUEST_EMAIL = 'guest@intellipantry.app';
const GUEST_USERNAME = 'Guest';

const envResult = z.object({ MONGODB_URI: z.string().min(1) }).safeParse(process.env);
if (!envResult.success) {
  logger.error('Missing required env var: MONGODB_URI');
  process.exit(1);
}

try {
  await mongoose.connect(envResult.data.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });

  let guest = await User.findOne({ email: GUEST_EMAIL }).select('_id');
  let created = false;

  if (!guest) {
    // Random throwaway password: never stored in plain text or printed.
    // Nobody can log in as Guest with credentials — only POST /api/auth/demo can.
    guest = await User.create({
      userName: GUEST_USERNAME,
      email: GUEST_EMAIL,
      password: randomBytes(32).toString('hex'),
    });
    created = true;
  }

  logger.info(created ? 'Guest user created.' : 'Guest user already exists.');
  logger.info(`DEMO_USER_ID=${guest._id.toString()}`);
} catch (err) {
  logger.error(
    `Seed failed: ${err instanceof Error ? err.message.replace(/\/\/[^@\s]*@/g, '//[REDACTED]@') : 'unknown error'}`,
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
