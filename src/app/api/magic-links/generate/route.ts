import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { client_id } = await req.json();
    if (!client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

    const supabase = createAdminClient();

    // Get client + firm
    const { data: client, error } = await supabase
      .from("clients")
      .select("id, firm_id, name, email")
      .eq("id", client_id)
      .single();

    if (error || !client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Upsert — one active link per client
    await supabase.from("client_magic_links").delete().eq("client_id", client_id);
    await supabase.from("client_magic_links").insert({
      client_id,
      firm_id: client.firm_id,
      token,
      expires_at,
    });

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${token}`;

    return NextResponse.json({ success: true, token, portal_url: portalUrl, expires_at });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
