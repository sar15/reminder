/**
 * Returns the base URL of the app — works in dev, Vercel preview, and production.
 * Never hardcode localhost — use this everywhere a full URL is needed.
 */
export function getBaseUrl(): string {
  // Vercel sets this automatically on every deployment
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Explicit override (set in .env.local for local dev)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return "http://localhost:3000";
}

export function getPortalUrl(token: string): string {
  return `${getBaseUrl()}/portal/${token}`;
}
