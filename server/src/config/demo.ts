// Single source of truth for how the Guest (demo) user is identified.
// Constants only — no env import — so the seed script can use it before DEMO_USER_ID exists.
// Feature 14's nightly cron must reuse findDemoUser() from auth.service.ts, not re-derive this.
export const GUEST_EMAIL = "guest@intellipantry.app";
export const GUEST_USERNAME = "Guest";
