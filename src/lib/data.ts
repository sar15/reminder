/**
 * Data access layer
 * Uses real Supabase when env vars are set, mock data otherwise (demo mode)
 */
import { MOCK_CLIENTS, MOCK_TASKS, MOCK_AUDIT_LOGS } from "./mock-data";
import type { Client, ComplianceTask, AuditLog } from "@/types";

export const IS_MOCK =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url";

// ── Clients ──────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  if (IS_MOCK) return MOCK_CLIENTS;
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("status", "active")
    .order("name");
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  if (IS_MOCK) return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).single();
  return data as Client | null;
}

// ── Tasks ─────────────────────────────────────────────────────
export async function getAllTasks(): Promise<ComplianceTask[]> {
  if (IS_MOCK) return MOCK_TASKS;
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("compliance_tasks")
    .select("*")
    .order("due_date");
  return (data ?? []) as ComplianceTask[];
}

export async function getTasksForClient(clientId: string): Promise<ComplianceTask[]> {
  if (IS_MOCK) return MOCK_TASKS.filter((t) => t.client_id === clientId);
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("due_date");
  return (data ?? []) as ComplianceTask[];
}

// ── Audit Logs ────────────────────────────────────────────────
export async function getAuditLogsForClient(clientId: string): Promise<AuditLog[]> {
  if (IS_MOCK)
    return MOCK_AUDIT_LOGS.filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .eq("client_id", clientId)
    .order("timestamp", { ascending: false })
    .limit(50);
  return (data ?? []) as AuditLog[];
}

export async function getAllAuditLogsForClient(clientId: string): Promise<AuditLog[]> {
  if (IS_MOCK)
    return MOCK_AUDIT_LOGS.filter((l) => l.client_id === clientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .eq("client_id", clientId)
    .order("timestamp", { ascending: true });
  return (data ?? []) as AuditLog[];
}
