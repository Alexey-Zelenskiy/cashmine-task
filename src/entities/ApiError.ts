import { z } from "zod";

export const ApiErrorCode = z.enum([
  "VALIDATION",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "IDEMPOTENCY_MISMATCH",
  "RATE_LIMITED",
  "SERVER",
  "TIMEOUT",
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

export const ApiErrorBody = z.object({
  error: z.object({
    code: ApiErrorCode,
    message: z.string(),
    field: z.string().optional(),
    retryAfterMs: z.number().optional(),
  }),
});
