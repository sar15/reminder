import type { Channel } from "@/types";

export type ReminderChannel = Extract<Channel, "email" | "whatsapp">;
export type ReminderCadence = "T-7" | "T-3" | "T-1";

export interface ReminderRule {
  cadence: ReminderCadence;
  offset_days: number;
  channels: ReminderChannel[];
  enabled: boolean;
}

export const REMINDER_OFFSET_DAYS: Record<ReminderCadence, number> = {
  "T-7": 7,
  "T-3": 3,
  "T-1": 1,
};

export const REMINDER_CADENCE_ORDER: ReminderCadence[] = ["T-7", "T-3", "T-1"];

export const DEFAULT_REMINDER_RULES: ReminderRule[] = [
  { cadence: "T-7", offset_days: 7, channels: ["email"], enabled: true },
  { cadence: "T-3", offset_days: 3, channels: ["email"], enabled: true },
  { cadence: "T-1", offset_days: 1, channels: ["email"], enabled: true },
];

function normalizeChannels(channels: unknown): ReminderChannel[] {
  if (!Array.isArray(channels)) return [];
  return Array.from(
    new Set(
      channels.filter(
        (c): c is ReminderChannel => c === "email" || c === "whatsapp"
      )
    )
  );
}

export function normalizeReminderRules(
  input?: Partial<ReminderRule>[]
): ReminderRule[] {
  const incoming = new Map(
    (input ?? [])
      .filter(
        (r): r is Partial<ReminderRule> & { cadence: ReminderCadence } =>
          typeof r?.cadence === "string" && r.cadence in REMINDER_OFFSET_DAYS
      )
      .map((r) => [r.cadence, r])
  );

  return REMINDER_CADENCE_ORDER.map((cadence) => {
    const fallback = DEFAULT_REMINDER_RULES.find((r) => r.cadence === cadence)!;
    const cur = incoming.get(cadence);
    return {
      cadence,
      offset_days: REMINDER_OFFSET_DAYS[cadence],
      channels: normalizeChannels(cur?.channels).length
        ? normalizeChannels(cur?.channels)
        : fallback.channels,
      enabled:
        typeof cur?.enabled === "boolean" ? cur.enabled : fallback.enabled,
    };
  });
}
