import { getAuthenticatedUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { addTaskSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiValidationError, ErrorCode, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/tasks — Create a single compliance task.
 * Validates client_id, compliance_type, period, due_date.
 * Requires authentication — uses session's firm_id.
 */
export const POST = withErrorHandler(async (req: Request) => {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401);
  }

  const body = await req.json();
  const parsed = addTaskSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { client_id, compliance_type, period, due_date } = parsed.data;
  const supabase = createAdminClient();

  // Verify client exists and get firm_id
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("id, firm_id")
    .eq("id", client_id)
    .single();

  if (clientErr || !client) {
    return apiError("Client not found", ErrorCode.NOT_FOUND, 404);
  }

  // Authorization check — ensure the client belongs to the user's firm
  if (client.firm_id !== auth.firmId) {
    return apiError("Unauthorized: client does not belong to your firm", ErrorCode.UNAUTHORIZED, 403);
  }

  // Insert the task
  const { data: task, error: taskErr } = await supabase
    .from("compliance_tasks")
    .insert({
      client_id,
      firm_id: auth.firmId,
      compliance_type,
      period,
      due_date,
      status: "pending",
    })
    .select("id")
    .single();

  if (taskErr || !task) {
    return apiError(
      taskErr?.message ?? "Failed to create task",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    task_id:    task.id,
    firm_id:    auth.firmId,
    client_id,
    action:     "task_created",
    channel:    null,
    message_id: null,
    metadata: { compliance_type, period, due_date, source: "manual" },
  });

  return apiSuccess({ task_id: task.id }, { created: true });
});
