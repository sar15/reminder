import { generateMagicLink } from "@/lib/magic-link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateMagicLinkSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiValidationError, ErrorCode, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/magic-links/generate
 * Requires auth — verifies client belongs to the authenticated firm.
 * Rate limited: max 5 per client per hour.
 */
export const POST = withErrorHandler(async (req: Request) => {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401);
  }

  const body = await req.json();
  const parsed = generateMagicLinkSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { client_id } = parsed.data;
  const supabase = createAdminClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("id, firm_id, name")
    .eq("id", client_id)
    .eq("firm_id", auth.firmId)   // ← firm isolation
    .single();

  if (error || !client) {
    return apiError("Client not found", ErrorCode.NOT_FOUND, 404);
  }

  try {
    const link = await generateMagicLink(client.id, client.firm_id);
    return apiSuccess({ token: link.token, portal_url: link.url, expires_at: link.expires_at });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate link";
    if (msg.includes("Rate limit")) return apiError(msg, ErrorCode.RATE_LIMITED, 429);
    return apiError(msg, ErrorCode.INTERNAL_ERROR, 500);
  }
});
