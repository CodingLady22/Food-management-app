import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "must be at least 32 characters"),
  GEMINI_API_KEY: z.string().min(1),
  // Free-tier model names and quotas change; unverified default — confirm in AI Studio.
  GEMINI_MODEL: z.preprocess(
    (v) => (v === "" ? undefined : v), // blank line in .env means "use the default"
    z.string().min(1).default("gemini-3.5-flash-lite"),
  ),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  // Optional until the Guest user is seeded (feature 02) and enforced (feature 14).
  DEMO_USER_ID: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "must be a 24-char ObjectId")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type Env = z.infer<typeof schema>;

const parse = (): Env => {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    // Print variable names and reasons only — never values.
    const lines = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    process.stderr.write(`Invalid environment configuration:\n${lines.join("\n")}\n`);
    process.exit(1);
  }
  return result.data;
};

export const env: Env = parse();
