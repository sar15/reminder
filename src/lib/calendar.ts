/**
 * Compliance Calendar Engine
 * Auto-generates due dates for all compliance types based on Indian tax calendar
 */
import type { ComplianceType } from "@/types";

export interface GeneratedTask {
  compliance_type: ComplianceType;
  period: string;
  due_date: string; // YYYY-MM-DD
  is_extended?: boolean;
  source_notification?: string | null;
}

export interface CalendarOverride {
  updated_due_date: string;
  source_notification?: string | null;
  is_extended?: boolean;
}

export type CalendarOverrideMap = Partial<Record<ComplianceType, CalendarOverride>>;

function pad(n: number) { return String(n).padStart(2, "0"); }
function ymd(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}
function formatToday(date: Date) {
  return ymd(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function applyOverride(
  type: ComplianceType,
  tasks: GeneratedTask[],
  today: Date,
  overrides?: CalendarOverrideMap
): GeneratedTask[] {
  const override = overrides?.[type];
  if (!override?.updated_due_date) return tasks;

  const nextTaskIndex = tasks.findIndex((task) => task.due_date >= formatToday(today));
  if (nextTaskIndex < 0) return tasks;

  const nextTask = tasks[nextTaskIndex];
  if (nextTask.due_date === override.updated_due_date) return tasks;

  const updated = [...tasks];
  updated[nextTaskIndex] = {
    ...nextTask,
    due_date: override.updated_due_date,
    is_extended: override.is_extended ?? true,
    source_notification: override.source_notification ?? null,
  };

  return updated.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

/** Generate upcoming tasks for a compliance type (next 12 months) */
export function generateTasks(
  type: ComplianceType,
  options?: { today?: Date; overrides?: CalendarOverrideMap }
): GeneratedTask[] {
  const today = options?.today ?? new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const tasks: GeneratedTask[] = [];

  switch (type) {
    // ── Monthly GST ──────────────────────────────────────────
    case "GSTR1": {
      for (let i = 0; i < 12; i++) {
        const m = ((currentMonth - 1 + i) % 12) + 1;
        const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);
        // GSTR-1 for month M is due 11th of M+1
        const dueM = m === 12 ? 1 : m + 1;
        const dueY = m === 12 ? y + 1 : y;
        tasks.push({
          compliance_type: type,
          period: `${y}-${pad(m)}`,
          due_date: ymd(dueY, dueM, 11),
        });
      }
      break;
    }
    case "GSTR3B": {
      for (let i = 0; i < 12; i++) {
        const m = ((currentMonth - 1 + i) % 12) + 1;
        const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);
        const dueM = m === 12 ? 1 : m + 1;
        const dueY = m === 12 ? y + 1 : y;
        tasks.push({
          compliance_type: type,
          period: `${y}-${pad(m)}`,
          due_date: ymd(dueY, dueM, 20),
        });
      }
      break;
    }

    // ── Monthly TDS Payment ──────────────────────────────────
    case "TDS_PAYMENT": {
      for (let i = 0; i < 12; i++) {
        const m = ((currentMonth - 1 + i) % 12) + 1;
        const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);
        const dueM = m === 12 ? 1 : m + 1;
        const dueY = m === 12 ? y + 1 : y;
        tasks.push({
          compliance_type: type,
          period: `${y}-${pad(m)}`,
          due_date: ymd(dueY, dueM, 7),
        });
      }
      break;
    }

    // ── Monthly PF / ESI ─────────────────────────────────────
    case "PF":
    case "ESI": {
      for (let i = 0; i < 12; i++) {
        const m = ((currentMonth - 1 + i) % 12) + 1;
        const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);
        const dueM = m === 12 ? 1 : m + 1;
        const dueY = m === 12 ? y + 1 : y;
        tasks.push({
          compliance_type: type,
          period: `${y}-${pad(m)}`,
          due_date: ymd(dueY, dueM, 15),
        });
      }
      break;
    }

    // ── Quarterly TDS Returns ────────────────────────────────
    case "TDS_RETURN_24Q":
    case "TDS_RETURN_26Q": {
      // Q1: Apr-Jun → due 31 Jul | Q2: Jul-Sep → due 31 Oct | Q3: Oct-Dec → due 31 Jan | Q4: Jan-Mar → due 31 May
      const quarters = [
        { period: `Q1 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due: ymd(currentYear, 7, 31) },
        { period: `Q2 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due: ymd(currentYear, 10, 31) },
        { period: `Q3 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due: ymd(currentYear + 1, 1, 31) },
        { period: `Q4 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due: ymd(currentYear + 1, 5, 31) },
      ];
      quarters.forEach(q => tasks.push({ compliance_type: type, period: q.period, due_date: q.due }));
      break;
    }

    // ── Quarterly Advance Tax ────────────────────────────────
    case "ADVANCE_TAX": {
      const fy = `FY${currentYear}-${String(currentYear + 1).slice(2)}`;
      [
        { period: `Q1 ${fy}`, due: ymd(currentYear, 6, 15) },
        { period: `Q2 ${fy}`, due: ymd(currentYear, 9, 15) },
        { period: `Q3 ${fy}`, due: ymd(currentYear, 12, 15) },
        { period: `Q4 ${fy}`, due: ymd(currentYear + 1, 3, 15) },
      ].forEach(q => tasks.push({ compliance_type: type, period: q.period, due_date: q.due }));
      break;
    }

    // ── Annual ITR ───────────────────────────────────────────
    case "ITR_NON_AUDIT": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 7, 31) });
      break;
    }
    case "ITR_AUDIT": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 10, 31) });
      break;
    }
    case "TAX_AUDIT_3CD": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 9, 30) });
      break;
    }

    // ── Annual GST ───────────────────────────────────────────
    case "GSTR9": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 12, 31) });
      break;
    }

    // ── Annual ROC ───────────────────────────────────────────
    case "AOC4": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 10, 29) });
      break;
    }
    case "MGT7": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 11, 29) });
      break;
    }
    case "DIR3_KYC": {
      tasks.push({ compliance_type: type, period: String(currentYear), due_date: ymd(currentYear, 9, 30) });
      break;
    }

    // ── Half-yearly MSME ─────────────────────────────────────
    case "MSME1": {
      tasks.push(
        { compliance_type: type, period: `H1 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due_date: ymd(currentYear, 4, 30) },
        { compliance_type: type, period: `H2 FY${currentYear}-${String(currentYear + 1).slice(2)}`, due_date: ymd(currentYear, 10, 31) },
      );
      break;
    }

    // ── Annual LLP ───────────────────────────────────────────
    case "LLP_FORM11": {
      const fy = `FY${currentYear - 1}-${String(currentYear).slice(2)}`;
      tasks.push({ compliance_type: type, period: fy, due_date: ymd(currentYear, 5, 30) });
      break;
    }
  }

  // Filter out past dates (keep only future/current)
  const todayStr = formatToday(today);
  return applyOverride(
    type,
    tasks.filter((task) => task.due_date >= todayStr),
    today,
    options?.overrides
  );
}

/** Generate all tasks for a list of compliance types */
export function generateAllTasks(
  types: ComplianceType[],
  options?: { today?: Date; overrides?: CalendarOverrideMap }
): GeneratedTask[] {
  return types
    .flatMap((type) => generateTasks(type, options))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

/** Human-readable due date description */
export function dueDateDescription(type: ComplianceType): string {
  const map: Record<string, string> = {
    GSTR1:          "11th of following month",
    GSTR3B:         "20th of following month",
    TDS_PAYMENT:    "7th of following month",
    TDS_RETURN_24Q: "31st of month after quarter",
    TDS_RETURN_26Q: "31st of month after quarter",
    ADVANCE_TAX:    "15th Jun / Sep / Dec / Mar",
    ITR_NON_AUDIT:  "31st July",
    ITR_AUDIT:      "31st October",
    TAX_AUDIT_3CD:  "30th September",
    GSTR9:          "31st December",
    AOC4:           "29th October",
    MGT7:           "29th November",
    DIR3_KYC:       "30th September",
    MSME1:          "30th Apr / 31st Oct",
    PF:             "15th of following month",
    ESI:            "15th of following month",
    LLP_FORM11:     "30th May",
  };
  return map[type] ?? "As applicable";
}
