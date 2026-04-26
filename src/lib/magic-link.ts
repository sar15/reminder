/**
 * Magic link generation — creates a secure token for client portal access.
 * Token is stored in client_magic_links table and expires in 7 days.
 *
 * Rate limited: max 5 generations per client per hour.
 * Rate limit counts from audit_log (not from magic_links table, since we delete old links).
 */
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPortalUrl } from "@/lib/url";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function generateMagicLink(
  clientId: string,
  firmId: string
): Promise<{ token: string; url: string; expires_at: string }> {
  const supabase = createAdminClient();

  // ── Rate limit check (count from audit_log, not magic_links) ──
  // We can't count from magic_links because we DELETE old links below.
  // Instead, count magic_link_generated actions in audit_log (immutable).
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("action", "magic_link_generated")
    .gte("timestamp", windowStart);

  if (!countError && (count ?? 0) >= RATE_LIMIT_MAX) {
    throw new Error("Rate limit exceeded: max 5 magic links per client per hour");
  }

  const token = randomBytes(32).toString("hex");
  const expires_at = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Delete any existing link for this client, then insert fresh
  await supabase
    .from("client_magic_links")
    .delete()
    .eq("client_id", clientId);

  const { error } = await supabase.from("client_magic_links").insert({
    client_id: clientId,
    firm_id: firmId,
    token,
    expires_at,
  });

  if (error) throw new Error(`Magic link insert failed: ${error.message}`);

  // Log to audit trail (immutable — this is what the rate limiter counts)
  await supabase.from("audit_log").insert({
    task_id:    null,  // no task context for magic link generation
    firm_id:    firmId,
    client_id:  clientId,
    action:     "magic_link_generated",
    channel:    null,
    message_id: null,
    metadata:   { token_prefix: token.slice(0, 8), expires_at },
  });

  return { token, url: getPortalUrl(token), expires_at };
}

export async function validateMagicLink(token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("client_magic_links")
    .select("*, clients(*)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}
