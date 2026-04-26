"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateMasterCalendar(
  complianceType: string,
  newDueDate: string
) {
  const supabase = createAdminClient();

  const { error: calError } = await supabase
    .from("compliance_calendar")
    .update({
      updated_due_date: newDueDate,
      is_extended: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("compliance_type", complianceType);

  if (calError) {
    return { success: false, error: calError.message };
  }

  // 2. Cascade update to all PENDING tasks of this type
  // A task is pending if it's not filed/docs_received/in_progress/review_ready
  const { error: taskError } = await supabase
    .from("compliance_tasks")
    .update({ due_date: newDueDate } as never)
    .eq("compliance_type", complianceType)
    .not("status", "in", '("filed","docs_received","in_progress","review_ready")');

  if (taskError) {
    return { success: false, error: taskError.message };
  }

  // 3. Add an audit log entry for this system-wide change
  // audit_log requires client_id/firm_id — skip for system-level events
  // (these are tracked via cron_executions instead)

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true };
}

export async function createComplianceType(
  complianceType: string,
  dueDate: string,
  frequency: string
) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("compliance_calendar").insert({
    compliance_type: complianceType.toUpperCase().replace(/\s+/g, '_'),
    standard_due_date: dueDate,
    frequency: frequency,
    is_extended: false,
    updated_at: new Date().toISOString()
  } as never);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
