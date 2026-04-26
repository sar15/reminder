import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, ErrorCode } from "@/lib/api-response";
import { z } from "zod";

const paramsSchema = z.object({ clientId: z.string().uuid("Invalid client ID") });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const parsed = paramsSchema.safeParse({ clientId });
  if (!parsed.success) {
    return apiError("Invalid client ID", ErrorCode.VALIDATION_ERROR, 400);
  }

  const supabase = createAdminClient();

  // Fetch client first to get firm_id for the firm query
  const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();

  const [
    { data: tasks },
    { data: logs },
    { data: firm },
  ] = await Promise.all([
    supabase.from("compliance_tasks").select("*").eq("client_id", clientId).order("due_date"),
    supabase.from("audit_log").select("*").eq("client_id", clientId).order("timestamp", { ascending: true }),
    client
      ? supabase.from("firms").select("name, email").eq("id", client.firm_id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!client) {
    return apiError("Client not found", ErrorCode.NOT_FOUND, 404);
  }

  // Dynamic import — @react-pdf/renderer is heavy, only load when needed
  const pdfRenderer = await import("@react-pdf/renderer");
  const { LiabilityReportDocument } = await import("@/lib/pdf");
  const React = await import("react");

  const element = React.createElement(LiabilityReportDocument, {
    client:      client as Parameters<typeof LiabilityReportDocument>[0]["client"],
    tasks:       (tasks ?? []) as Parameters<typeof LiabilityReportDocument>[0]["tasks"],
    logs:        (logs ?? []) as Parameters<typeof LiabilityReportDocument>[0]["logs"],
    firmName:    firm?.name ?? "CA Firm",
    firmEmail:   firm?.email ?? "",
    generatedAt: new Date().toISOString(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await pdfRenderer.renderToBuffer(element as any);

  const fileName = `liability-report-${client.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Content-Length":      String(pdfBuffer.length),
    },
  });
}
