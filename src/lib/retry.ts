/**
 * Retry with exponential backoff.
 * Default: 3 attempts, 1s → 2s → 4s delays.
 *
 * Only retries on transient errors (network failures, 5xx, 429).
 * Does NOT retry on 4xx validation errors (except 429).
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  shouldRetry: () => true,
  onRetry: () => {},
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts) break;
      if (!opts.shouldRetry(error, attempt)) break;

      opts.onRetry(error, attempt);

      const delay = opts.baseDelayMs * Math.pow(2, attempt - 1);
      // Add jitter: ±25% to prevent thundering herd
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      await sleep(Math.max(0, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Check if an error is transient (worth retrying).
 * Used for email/API calls where 4xx = bad request (don't retry),
 * but 5xx/network = transient (do retry).
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Network-level errors
    if (msg.includes("fetch failed") || msg.includes("econnrefused") ||
        msg.includes("timeout") || msg.includes("enotfound") ||
        msg.includes("socket hang up") || msg.includes("network")) {
      return true;
    }
  }

  // Resend SDK errors with statusCode
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const code = (error as { statusCode: number }).statusCode;
    return code === 429 || code >= 500;
  }

  return true; // default: retry on unknown errors
}
