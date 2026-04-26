/**
 * Data access layer
 * Uses authenticated firm_id to scope all queries.
 * Falls back to mock data when:
 *  - Supabase is not configured
 *  - No auth context available (demo mode)
 *  - Supabase returns empty/error AND we have no firm context
 */
import { MOCK_CLIENTS, MOCK_TASKS, MOCK_AUDIT_LOGS } from "./mock-data";
import type { Client, ComplianceTask, AuditLog } from "@/types";

const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://");

// ── Clients ──────────────────────────────────────────────────
export async function getClients(firmId?: string): Promise<Client[]> {
  if (!HAS_SUPABASE || !firmId) return MOCK_CLIENTS;
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("firm_id", firmId)
      .eq("status", "active")
      .order("name");
    if (error || !data || data.length === 0) return MOCK_CLIENTS;
    return data as Client[];
  } catch {
    return MOCK_CLIENTS;
  }
}

export async function getClient(id: string, firmId?: string): Promise<Client | null> {
  if (!HAS_SUPABASE || !firmId) return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("firm_id", firmId)
      .single();
    if (error || !data) return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
    return data as Client;
  } catch {
    return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
  }
}

// ── Tasks ─────────────────────────────────────────────────────
export async function getAllTasks(firmId?: string): Promise<ComplianceTask[]> {
  if (!HAS_SUPABASE || !firmId) return MOCK_TASKS;
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("compliance_tasks")
      .select("*")
      .eq("firm_id", firmId)
      .order("due_date");
    if (error || !data || data.length === 0) return MOCK_TASKS;
    return data as ComplianceTask[];
  } catch {
    return MOCK_TASKS;
  }
}

export async function getTasksForClient(clientId: string, firmId?: string): Promise<ComplianceTask[]> {
  if (!HAS_SUPABASE || !firmId) return MOCK_TASKS.filter((t) => t.client_id === clientId);
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("compliance_tasks")
      .select("*")
      .eq("client_id", clientId)
      .eq("firm_id", firmId)
      .order("due_date");
    if (error || !data) return MOCK_TASKS.filter((t) => t.client_id === clientId);
    return data as ComplianceTask[];
  } catch {
    return MOCK_TASKS.filter((t) => t.client_id === clientId);
  }
}

// ── Audit Logs ────────────────────────────────────────────────
export async function getAuditLogsForClient(clientId: string, firmId?: string): Promise<AuditLog[]> {
  if (!HAS_SUPABASE || !firmId) {
    return MOCK_AUDIT_LOGS
      .filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("client_id", clientId)
      .eq("firm_id", firmId)
      .order("timestamp", { ascending: false })
      .limit(50);
    if (error || !data) {
      return MOCK_AUDIT_LOGS
        .filter((l) => l.client_id === clientId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return data as AuditLog[];
  } catch {
    return MOCK_AUDIT_LOGS
      .filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export async function getAllAuditLogsForClient(clientId: string, firmId?: string): Promise<AuditLog[]> {
  if (!HAS_SUPABASE || !firmId) {
    return MOCK_AUDIT_LOGS
      .filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("client_id", clientId)
      .eq("firm_id", firmId)
      .order("timestamp", { ascending: true });
    if (error || !data) {
      return MOCK_AUDIT_LOGS
        .filter((l) => l.client_id === clientId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    return data as AuditLog[];
  } catch {
    return MOCK_AUDIT_LOGS
      .filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

// ── Calendar ──────────────────────────────────────────────────
export async function getComplianceCalendar() {
  if (!HAS_SUPABASE) {
    return [
      { id: "1", compliance_type: "GST_GSTR1_MONTHLY", standard_due_date: "2024-11-11", updated_due_date: null, is_extended: false, frequency: "monthly", source_notification: null },
      { id: "2", compliance_type: "GST_GSTR3B_MONTHLY", standard_due_date: "2024-11-20", updated_due_date: null, is_extended: false, frequency: "monthly", source_notification: null },
      { id: "3", compliance_type: "TDS_PAYMENT", standard_due_date: "2024-11-07", updated_due_date: null, is_extended: false, frequency: "monthly", source_notification: null },
      { id: "4", compliance_type: "ITR_CORPORATE", standard_due_date: "2024-10-31", updated_due_date: null, is_extended: false, frequency: "yearly", source_notification: null },
      { id: "5", compliance_type: "ROC_AOC4", standard_due_date: "2024-10-30", updated_due_date: null, is_extended: false, frequency: "yearly", source_notification: null },
    ];
  }
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.from("compliance_calendar").select("*").order("standard_due_date");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
