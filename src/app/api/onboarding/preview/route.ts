import { previewGeneratedTasks } from "@/lib/onboarding";
import { onboardingPreviewSchema } from "@/lib/validations";
import { apiSuccess, apiValidationError, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/onboarding/preview
 * Preview auto-generated tasks before saving.
 * Validates client names and compliance types.
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const parsed = onboardingPreviewSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const tasks = await previewGeneratedTasks(parsed.data.clients);

  return apiSuccess(undefined, {
    tasks,
    extended_count: tasks.filter((task) => task.is_extended).length,
  });
});
