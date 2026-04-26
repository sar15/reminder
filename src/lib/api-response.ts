import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ─── Standard API response types ─────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, string[]>;
}

// ─── Error codes ─────────────────────────────────────────────

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  EMAIL_FAILED: "EMAIL_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
} as const;

// ─── Response helpers ────────────────────────────────────────

export function apiSuccess<T>(data?: T, extra?: Record<string, unknown>): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true as const, data, ...extra });
}

export function apiError(
  error: string,
  code: string,
  status: number,
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json({ success: false as const, error, code, details }, { status });
}

export function apiValidationError(zodError: ZodError): NextResponse<ApiError> {
  const fieldErrors = zodError.flatten().fieldErrors;
  const allMessages = Object.values(fieldErrors).flat().filter(Boolean) as string[];
  const firstError = allMessages[0] ?? "Validation failed";

  return apiError(
    firstError,
    ErrorCode.VALIDATION_ERROR,
    400,
    fieldErrors as Record<string, string[]>
  );
}

/**
 * Wraps an API route handler with centralized error handling.
 * Catches all errors and returns consistent format. Never leaks internals.
 */
export function withErrorHandler(
  handler: (req: Request, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error: unknown) {
      console.error("[API Error]", error);

      if (error instanceof ZodError) {
        return apiValidationError(error);
      }

      // Never leak internal error messages to client
      return apiError(
        "An unexpected error occurred. Please try again.",
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  };
}
