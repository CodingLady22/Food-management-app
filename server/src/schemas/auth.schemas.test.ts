import { describe, expect, it } from "vitest";
import { GUEST_EMAIL } from "../config/demo.js";
import { loginSchema, signupSchema } from "./auth.schemas.js";

const valid = {
  userName: "maye",
  email: "Maye@Example.com ",
  password: "correct-horse",
  confirmPassword: "correct-horse",
};

const issuePaths = (result: ReturnType<typeof signupSchema.safeParse>): string[] =>
  result.success ? [] : result.error.issues.map((i) => i.path.join("."));

describe("signupSchema", () => {
  it("accepts a valid body and normalises the email", () => {
    const result = signupSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("maye@example.com");
  });

  it.each([GUEST_EMAIL, GUEST_EMAIL.toUpperCase(), `  ${GUEST_EMAIL}  `])(
    "rejects the reserved Guest email (%j)",
    (email) => {
      expect(issuePaths(signupSchema.safeParse({ ...valid, email }))).toContain("email");
    },
  );

  it.each(["Guest", "guest", "GUEST", "  guest  "])("rejects the reserved Guest username (%j)", (userName) => {
    expect(issuePaths(signupSchema.safeParse({ ...valid, userName }))).toContain("userName");
  });

  it("allows usernames that merely contain 'guest'", () => {
    expect(signupSchema.safeParse({ ...valid, userName: "guesty" }).success).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    const body = { ...valid, password: "short12", confirmPassword: "short12" };
    expect(issuePaths(signupSchema.safeParse(body))).toContain("password");
  });

  it("accepts a password of exactly 72 bytes and rejects 73", () => {
    const ok = "a".repeat(72);
    const tooLong = "a".repeat(73);
    expect(signupSchema.safeParse({ ...valid, password: ok, confirmPassword: ok }).success).toBe(true);
    expect(
      issuePaths(signupSchema.safeParse({ ...valid, password: tooLong, confirmPassword: tooLong })),
    ).toContain("password");
  });

  it("measures the 72-byte cap in bytes, not characters", () => {
    // 40 × "é" = 40 characters but 80 bytes
    const multibyte = "é".repeat(40);
    expect(multibyte.length).toBeLessThanOrEqual(72);
    const result = signupSchema.safeParse({ ...valid, password: multibyte, confirmPassword: multibyte });
    expect(issuePaths(result)).toContain("password");
  });

  it("rejects mismatched confirmation on confirmPassword", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "different-one" });
    expect(issuePaths(result)).toContain("confirmPassword");
  });

  it("rejects an invalid email and an out-of-range username length", () => {
    expect(issuePaths(signupSchema.safeParse({ ...valid, email: "not-an-email" }))).toContain("email");
    expect(issuePaths(signupSchema.safeParse({ ...valid, userName: "a" }))).toContain("userName");
    expect(issuePaths(signupSchema.safeParse({ ...valid, userName: "a".repeat(31) }))).toContain("userName");
  });
});

describe("loginSchema", () => {
  it("checks presence only — weak passwords are fine at login", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("normalises the email and rejects empty fields", () => {
    const ok = loginSchema.safeParse({ email: "  A@B.CO ", password: "x" });
    expect(ok.success && ok.data.email).toBe("a@b.co");
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
