import { sendTaskReminder } from "@/lib/reminder-dispatch";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { normalizeReminderRules } from "@/lib/reminder-rules";
import { sendReminderSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiValidationError, ErrorCode, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/reminders/send — Send a manual reminder.
 * Requires auth — verifies task belongs to the authenticated firm.
 */
export const POST = withErrorHandler(async (req: Request) => {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401);
  }

  const body = await req.json();
  const parsed = sendReminderSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { task_id, cadence, channels } = parsed.data;
  const [rule] = normalizeReminderRules([{ cadence, channels, enabled: true }]);
  const supabase = createAdminClient();

  const { data: task, error: taskError } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("id", task_id)
    .eq("firm_id", auth.firmId)   // ← firm isolation
    .single();

  if (taskError || !task) {
    return apiError("Task not found", ErrorCode.NOT_FOUND, 404);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", task.client_id)
    .eq("firm_id", auth.firmId)   // ← firm isolation
    .single();

  if (clientError || !client) {
    return apiError("Client not found", ErrorCode.NOT_FOUND, 404);
  }

  const result = await sendTaskReminder({
    supabase,
    task,
    client,
    cadence: rule.cadence,
    channels: rule.channels,
    automated: false,
  });

  if (!result.success) {
    return apiError("Reminder dispatch failed", ErrorCode.EMAIL_FAILED, 502);
  }

  return apiSuccess({ results: result.results });
});
