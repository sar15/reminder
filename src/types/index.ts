export type ComplianceType =
  | "GSTR1"
  | "GSTR3B"
  | "GSTR9"
  | "TDS_PAYMENT"
  | "TDS_RETURN_24Q"
  | "TDS_RETURN_26Q"
  | "ADVANCE_TAX"
  | "ITR_NON_AUDIT"
  | "ITR_AUDIT"
  | "TAX_AUDIT_3CD"
  | "AOC4"
  | "MGT7"
  | "DIR3_KYC"
  | "MSME1"
  | "PF"
  | "ESI"
  | "LLP_FORM11";

export type TaskStatus =
  | "pending"
  | "waiting_docs"
  | "docs_received"
  | "in_progress"
  | "review_ready"
  | "filed"
  | "overdue";

export type UserRole = "partner" | "senior" | "junior";
export type Plan = "starter" | "growth" | "professional" | "enterprise";
export type Channel = "email" | "sms";
export type Language = "en" | "hi" | "gu" | "mr" | "ta";

export type AuditAction =
  | "reminder_sent"
  | "delivered"
  | "opened"
  | "doc_uploaded"
  | "filed"
  | "escalated";

export interface Firm {
  id: string;
  name: string;
  partner_name: string | null;
  email: string;
  phone: string | null;
  plan: Plan;
  client_limit: number;
  created_at: string;
}

export interface User {
  id: string;
  firm_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Client {
  id: string;
  firm_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  pan: string | null;
  gstin: string | null;
  cin: string | null;
  compliance_types: ComplianceType[];
  preferred_language: Language;
  status: "active" | "inactive";
  created_at: string;
}

export interface ComplianceTask {
  id: string;
  client_id: string;
  firm_id: string;
  compliance_type: ComplianceType;
  period: string;
  due_date: string;
  status: TaskStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  client?: Client;
}

export interface AuditLog {
  id: string;
  task_id: string;
  firm_id: string;
  client_id: string;
  action: AuditAction;
  channel: Channel | null;
  message_id: string | null;
  metadata: Record<string, unknown> | null;
  performed_by: string | null;
  timestamp: string;
}

export interface Document {
  id: string;
  task_id: string;
  client_id: string;
  firm_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by_client: boolean;
  uploaded_at: string;
}

// Dashboard risk status derived from task
export type RiskLevel = "green" | "yellow" | "red";

export interface ClientRiskSummary {
  client: Client;
  tasks: ComplianceTask[];
  riskLevel: RiskLevel;
  nextDueDate: string | null;
  daysUntilDue: number | null;
  pendingDocsCount: number;
}
