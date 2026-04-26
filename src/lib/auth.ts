/**
 * Backend authentication & authorization layer.
 * Every protected server component / API route should call getAuthenticatedUser()
 * to get the current user + firm context.
 *
 * On first login after signup, this auto-creates the firm and user rows.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthContext {
  userId: string;
  email: string;
  firmId: string;
  firmName: string;
  partnerName: string;
  role: string;
}

/**
 * Gets the authenticated user from Supabase session.
 * Returns null if not authenticated.
 * Creates firm + user row if they don't exist yet (first login after signup).
 */
export async function getAuthenticatedUser(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const admin = createAdminClient();

    // Check if user row exists
    const { data: existingUser } = await admin
      .from("users")
      .select("id, firm_id, role, firms(id, name, partner_name)")
      .eq("id", user.id)
      .single();

    if (existingUser?.firm_id) {
      const firm = existingUser.firms as unknown as { id: string; name: string; partner_name: string | null } | null;
      return {
        userId: user.id,
        email: user.email!,
        firmId: existingUser.firm_id,
        firmName: firm?.name ?? "My Firm",
        partnerName: firm?.partner_name ?? user.user_metadata?.partner_name ?? "",
        role: existingUser.role ?? "partner",
      };
    }

    // First login — create firm + user rows from signup metadata
    const meta = user.user_metadata ?? {};
    const firmName = meta.firm_name || "My Firm";
    const partnerName = meta.partner_name || "";

    const { data: newFirm, error: firmErr } = await admin
      .from("firms")
      .insert({
        name: firmName,
        partner_name: partnerName,
        email: user.email!,
        plan: "starter",
        client_limit: 50,
      })
      .select("id")
      .single();

    if (firmErr || !newFirm) {
      console.error("[Auth] Failed to create firm:", firmErr?.message);
      return null;
    }

    const { error: userErr } = await admin
      .from("users")
      .insert({
        id: user.id,
        firm_id: newFirm.id,
        email: user.email!,
        full_name: partnerName,
        role: "partner",
      });

    if (userErr) {
      console.error("[Auth] Failed to create user:", userErr.message);
    }

    return {
      userId: user.id,
      email: user.email!,
      firmId: newFirm.id,
      firmName,
      partnerName,
      role: "partner",
    };
  } catch (err) {
    console.error("[Auth] Unexpected error:", err);
    return null;
  }
}

/**
 * Require authentication — redirects to login if not authenticated.
 * Use in server components / page.tsx files.
 */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    // redirect() throws — this line is never reached
    throw new Error("Unreachable");
  }
  return auth;
}
