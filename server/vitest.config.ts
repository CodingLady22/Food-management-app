import { defineConfig } from "vitest/config";

// Unit tests only: pure, security-critical logic (schemas, ownership helpers, daysLeft, AI output validation).
// No database, no network — keep it that way so `npm test` is fast and runs anywhere (CI included).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
