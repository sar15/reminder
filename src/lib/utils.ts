import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO } from "date-fns";
import type { RiskLevel, ComplianceTask } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Determine risk level for a client based on their tasks */
export function getRiskLevel(tasks: ComplianceTask[]): RiskLevel {
  const activeTasks = tasks.filter(
    (t) => t.status !== "filed"
  );
  if (activeTasks.length === 0) return "green";

  const today = new Date();
  const minDays = Math.min(
    ...activeTasks.map((t) =>
      differenceInDays(parseISO(t.due_date), today)
    )
  );

  if (minDays < 0) return "red"; // overdue
  if (minDays <= 5) return "red"; // < 5 days
  if (minDays <= 10) return "yellow"; // 5-10 days
  return "green";
}

/** Days until due date (negative = overdue) */
export function daysUntilDue(dueDate: string): number {
  return differenceInDays(parseISO(dueDate), new Date());
}

/** Format compliance type for display */
export function formatComplianceType(type: string): string {
  const map: Record<string, string> = {
    GSTR1: "GSTR-1",
    GSTR3B: "GSTR-3B",
    GSTR9: "GSTR-9/9C",
    TDS_PAYMENT: "TDS Payment",
    TDS_RETURN_24Q: "TDS Return (24Q)",
    TDS_RETURN_26Q: "TDS Return (26Q)",
    ADVANCE_TAX: "Advance Tax",
    ITR_NON_AUDIT: "ITR (Non-Audit)",
    ITR_AUDIT: "ITR (Audit)",
    TAX_AUDIT_3CD: "Tax Audit (3CD)",
    AOC4: "AOC-4",
    MGT7: "MGT-7",
    DIR3_KYC: "DIR-3 KYC",
    MSME1: "MSME-1",
    PF: "PF",
    ESI: "ESI",
    LLP_FORM11: "LLP Form 11",
  };
  return map[type] ?? type;
}

/** Penalty per day for a compliance type */
export function getPenaltyPerDay(type: string): number {
  const penalties: Record<string, number> = {
    GSTR1: 50,
    GSTR3B: 50,
    TDS_PAYMENT: 200,
    TDS_RETURN_24Q: 200,
    TDS_RETURN_26Q: 200,
    ITR_NON_AUDIT: 5000, // flat under 234F
    ITR_AUDIT: 5000,
    AOC4: 100,
    MGT7: 100,
  };
  return penalties[type] ?? 0;
}
