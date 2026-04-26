import { getAuthenticatedUser } from "@/lib/auth";
import { createClientsAndTasks, DEMO_FIRM_ID } from "@/lib/onboarding";
import { normalizeReminderRules } from "@/lib/reminder-rules";
import { createClientSchema, bulkClientSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiValidationError, ErrorCode, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/clients — Create a single client with tasks.
 * Validates PAN, GSTIN, email, compliance types via Zod.
 * Requires authentication — uses session's firm_id.
 */
export const POST = withErrorHandler(async (req: Request) => {
  const auth = await getAuthenticatedUser();
  const body = await req.json();
  const parsed = createClientSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { firm_id, auto_generate_tasks, rules, ...clientData } = parsed.data;

  // Use authenticated firm_id if available, fallback to provided or demo
  const effectiveFirmId = auth?.firmId ?? firm_id ?? DEMO_FIRM_ID;

  const result = await createClientsAndTasks({
    firmId: effectiveFirmId,
    autoGenerateTasks: auto_generate_tasks,
    rules: Array.isArray(rules) ? normalizeReminderRules(rules) : undefined,
    clients: [clientData],
  });

  if (result.failed > 0) {
    return apiError(
      result.errors?.[0] ?? "Failed to create client",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }

  return apiSuccess(undefined, {
    tasks_created: result.tasks_created,
    rules_saved: result.rules_saved,
  });
});

/**
 * PUT /api/clients — Bulk import multiple clients.
 * Validates each client's data via Zod.
 * Requires authentication — uses session's firm_id.
 */
export const PUT = withErrorHandler(async (req: Request) => {
  const auth = await getAuthenticatedUser();
  const body = await req.json();
  const parsed = bulkClientSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { clients, firm_id, auto_generate_tasks, rules } = parsed.data;

  // Use authenticated firm_id if available
  const effectiveFirmId = auth?.firmId ?? firm_id ?? DEMO_FIRM_ID;

  const result = await createClientsAndTasks({
    clients,
    firmId: effectiveFirmId,
    autoGenerateTasks: auto_generate_tasks,
    rules,
  });

  return apiSuccess(undefined, {
    created: result.created,
    failed: result.failed,
    tasks_created: result.tasks_created,
    rules_saved: result.rules_saved,
  });
});
