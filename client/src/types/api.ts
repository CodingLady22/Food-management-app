// Shared API types. Copied verbatim to client/src/types/api.ts — change both in the same commit.
export type HealthResponse = { ok: true };
export type ApiError = { error: string; fields?: { field: string; message: string }[] };
