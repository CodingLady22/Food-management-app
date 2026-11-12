// Shared API types. Copied verbatim to client/src/types/api.ts — change both in the same commit.
export type HealthResponse = { ok: true };
export type ApiError = { error: string; fields?: { field: string; message: string }[] };

// Auth. PublicUser is what every auth endpoint returns and what req.user holds — never the password hash.
export type PublicUser = { id: string; userName: string; email: string };
export type SignupRequest = { userName: string; email: string; password: string; confirmPassword: string };
export type LoginRequest = { email: string; password: string };
export type AuthResponse = { user: PublicUser };
