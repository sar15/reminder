import { generateAllTasks, type CalendarOverrideMap, type GeneratedTask } from "@/lib/calendar";
import { DEFAULT_REMINDER_RULES, normalizeReminderRules, type ReminderRule } from "@/lib/reminder-rules";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ComplianceType, Language } from "@/types";
import type { Database } from "@/types/database";

export const DEMO_FIRM_ID = "00000000-0000-0000-0000-000000000001";

const HAS_ADMIN_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

type ClientInsert = {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  gstin?: string;
  cin?: string;
  preferred_language?: Language;
  compliance_types?: ComplianceType[];
};

type ComplianceCalendarRow = Database["public"]["Tables"]["compliance_calendar"]["Row"];
type ReminderRuleRow = Database["public"]["Tables"]["reminder_rules"]["Row"];

export interface PreviewTask extends GeneratedTask {
  client_name: string;
}

export function hasAdminAccessEnv() {
  return HAS_ADMIN_ENV;
}

function normalizeClientInput(client: ClientInsert): ClientInsert {
  return {
    name: client.name.trim(),
    contact_name: client.contact_name?.trim() || "",
    email: client.email?.trim() || "",
    phone: client.phone?.trim() || "",
    pan: client.pan?.trim().toUpperCase() || "",
    gstin: client.gstin?.trim().toUpperCase() || "",
    cin: client.cin?.trim().toUpperCase() || "",
    preferred_language: client.preferred_language ?? "en",
    compliance_types: Array.from(new Set(client.compliance_types ?? [])),
  };
}

export async function getCalendarOverrideMap(): Promise<CalendarOverrideMap> {
  if (!HAS_ADMIN_ENV) return {};

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("compliance_calendar")
    .select("compliance_type, updated_due_date, source_notification, is_extended")
    .eq("is_extended", true)
    .not("updated_due_date", "is", null);

  if (error || !data) return {};

  return (data as Pick<ComplianceCalendarRow, "compliance_type" | "updated_due_date" | "source_notification" | "is_extended">[])
    .reduce<CalendarOverrideMap>((acc, row) => {
      acc[row.compliance_type as ComplianceType] = {
        updated_due_date: row.updated_due_date!,
        source_notification: row.source_notification,
        is_extended: row.is_extended,
      };
      return acc;
    }, {});
}

export async function previewGeneratedTasks(
  clients: ClientInsert[],
  today = new Date()
): Promise<PreviewTask[]> {
  const overrides = await getCalendarOverrideMap();

  return clients
    .map(normalizeClientInput)
    .filter((client) => client.name && (client.compliance_types?.length ?? 0) > 0)
    .flatMap((client) =>
      generateAllTasks(client.compliance_types ?? [], { today, overrides }).map((task) => ({
        ...task,
        client_name: client.name,
      }))
    )
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export async function getReminderRulesForFirm(firmId: string): Promise<ReminderRule[]> {
  if (!HAS_ADMIN_ENV) return DEFAULT_REMINDER_RULES;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reminder_rules")
    .select("*")
    .eq("firm_id", firmId)
    .order("offset_days", { ascending: false });

  if (error || !data || data.length === 0) {
    return DEFAULT_REMINDER_RULES;
  }

  return normalizeReminderRules(
    (data as ReminderRuleRow[]).map((rule) => ({
      cadence: rule.cadence as ReminderRule["cadence"],
      offset_days: rule.offset_days,
      channels: (rule.channels ?? []) as ReminderRule["channels"],
      enabled: rule.enabled,
    }))
  );
}

export async function saveReminderRulesForFirm(
  firmId: string,
  rulesInput?: Partial<ReminderRule>[]
): Promise<ReminderRule[]> {
  const rules = normalizeReminderRules(rulesInput);
  if (!HAS_ADMIN_ENV) return rules;

  const supabase = createAdminClient();
  const payload = rules.map((rule) => ({
    firm_id: firmId,
    cadence: rule.cadence,
    offset_days: rule.offset_days,
    channels: rule.channels,
    enabled: rule.enabled,
  }));

  const { error } = await supabase
    .from("reminder_rules")
    .upsert(payload, { onConflict: "firm_id,cadence" });

  if (error) {
    throw new Error(error.message);
  }

  return rules;
}

export async function createClientsAndTasks({
  clients,
  firmId = DEMO_FIRM_ID,
  autoGenerateTasks = true,
  rules,
}: {
  clients: ClientInsert[];
  firmId?: string;
  autoGenerateTasks?: boolean;
  rules?: Partial<ReminderRule>[];
}) {
  const cleanedClients = clients
    .map(normalizeClientInput)
    .filter((client) => client.name);

  const normalizedRules = normalizeReminderRules(rules);

  if (!HAS_ADMIN_ENV) {
    return {
      created: cleanedClients.length,
      failed: 0,
      errors: [] as string[],
      tasks_created: cleanedClients.reduce(
        (total, client) => total + (client.compliance_types?.length ? generateAllTasks(client.compliance_types).length : 0),
        0
      ),
      rules_saved: normalizedRules.length,
      demo: true,
    };
  }

  const supabase = createAdminClient();
  const overrides = await getCalendarOverrideMap();
  await saveReminderRulesForFirm(firmId, normalizedRules);

  const results = {
    created: 0,
    failed: 0,
    errors: [] as string[],
    tasks_created: 0,
    rules_saved: normalizedRules.length,
  };

  for (const client of cleanedClients) {
    const { data: insertedClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        firm_id: firmId,
        name: client.name,
        contact_name: client.contact_name || null,
        email: client.email || null,
        phone: client.phone || null,
        pan: client.pan || null,
        gstin: client.gstin || null,
        cin: client.cin || null,
        compliance_types: client.compliance_types ?? [],
        preferred_language: client.preferred_language ?? "en",
        status: "active",
      })
      .select()
      .single();

    if (clientError || !insertedClient) {
      results.failed += 1;
      results.errors.push(`${client.name}: ${clientError?.message ?? "Failed to create client"}`);
      continue;
    }

    results.created += 1;

    if (autoGenerateTasks && (client.compliance_types?.length ?? 0) > 0) {
      const generatedTasks = generateAllTasks(client.compliance_types ?? [], {
        today: new Date(),
        overrides,
      });

      if (generatedTasks.length > 0) {
        const { error: taskError } = await supabase
          .from("compliance_tasks")
          .insert(
            generatedTasks.map((task) => ({
              client_id: insertedClient.id,
              firm_id: firmId,
              compliance_type: task.compliance_type,
              period: task.period,
              due_date: task.due_date,
              status: "pending",
              notes: task.is_extended
                ? `Extended deadline synced from compliance calendar${task.source_notification ? ` (${task.source_notification})` : ""}`
                : null,
            }))
          );

        if (!taskError) {
          results.tasks_created += generatedTasks.length;
        }
      }
    }
  }

  return results;
}
