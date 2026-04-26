import { z } from "zod";

// ─── Regex patterns ──────────────────────────────────────────
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PHONE_REGEX = /^\+?[0-9\s\-]{7,15}$/;

// ─── Compliance type enum ────────────────────────────────────
export const COMPLIANCE_TYPES = [
  "GSTR1", "GSTR3B", "GSTR9",
  "TDS_PAYMENT", "TDS_RETURN_24Q", "TDS_RETURN_26Q",
  "ADVANCE_TAX", "ITR_NON_AUDIT", "ITR_AUDIT", "TAX_AUDIT_3CD",
  "AOC4", "MGT7", "DIR3_KYC", "MSME1", "PF", "ESI", "LLP_FORM11",
] as const;

export const complianceTypeSchema = z.enum(COMPLIANCE_TYPES);

// ─── Reusable field schemas ──────────────────────────────────
export const panSchema = z.string()
  .toUpperCase()
  .regex(PAN_REGEX, "Invalid PAN format (e.g. ABCDE1234F)")
  .optional()
  .or(z.literal(""));

export const gstinSchema = z.string()
  .toUpperCase()
  .regex(GSTIN_REGEX, "Invalid GSTIN format (e.g. 27ABCDE1234F1Z5)")
  .optional()
  .or(z.literal(""));

export const phoneSchema = z.string()
  .regex(PHONE_REGEX, "Invalid phone number")
  .optional()
  .or(z.literal(""));

// ─── Create client schema ────────────────────────────────────
export const createClientSchema = z.object({
  name: z.string().min(1, "Business name is required").max(200),
  contact_name: z.string().max(200).optional().default(""),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: phoneSchema.default(""),
  pan: panSchema.default(""),
  gstin: gstinSchema.default(""),
  cin: z.string().max(50).optional().default(""),
  compliance_types: z.array(complianceTypeSchema).min(1, "At least one compliance type is required"),
  preferred_language: z.enum(["en", "hi", "gu", "mr", "ta"]).default("en"),
  firm_id: z.string().uuid().optional(),
  auto_generate_tasks: z.boolean().default(true),
  rules: z.array(z.any()).optional(),
});

export const bulkClientSchema = z.object({
  clients: z.array(
    z.object({
      name: z.string().min(1, "Business name is required").max(200),
      contact_name: z.string().max(200).optional().default(""),
      email: z.string().email().optional().or(z.literal("")),
      phone: phoneSchema.default(""),
      pan: panSchema.default(""),
      gstin: gstinSchema.default(""),
      cin: z.string().max(50).optional().default(""),
      compliance_types: z.array(complianceTypeSchema).default([]),
      preferred_language: z.enum(["en", "hi", "gu", "mr", "ta"]).default("en"),
    })
  ).min(1, "At least one client is required"),
  firm_id: z.string().uuid().optional(),
  auto_generate_tasks: z.boolean().default(true),
  rules: z.array(z.any()).optional(),
});

// ─── Send reminder schema ────────────────────────────────────
export const sendReminderSchema = z.object({
  task_id: z.string().uuid("Invalid task ID"),
  cadence: z.enum(["T-7", "T-3", "T-1"]).default("T-3"),
  channels: z.array(z.enum(["email"])).min(1, "At least one channel required").default(["email"]),
});

// ─── Magic link schema ───────────────────────────────────────
export const generateMagicLinkSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  task_id: z.string().uuid("Invalid task ID"),
});

// ─── Portal upload schema ────────────────────────────────────
export const portalUploadSchema = z.object({
  token: z.string().min(1, "Token is required"),
  task_id: z.string().uuid("Invalid task ID"),
});

// ─── Add task schema ─────────────────────────────────────────
export const addTaskSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  compliance_type: complianceTypeSchema,
  period: z.string().min(1, "Period is required").max(20),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD"),
});

// ─── Onboarding preview schema ───────────────────────────────
export const onboardingPreviewSchema = z.object({
  clients: z.array(
    z.object({
      name: z.string().min(1),
      compliance_types: z.array(complianceTypeSchema).min(1),
    })
  ).min(1),
});

// ─── Type exports ────────────────────────────────────────────
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type BulkClientInput = z.infer<typeof bulkClientSchema>;
export type SendReminderInput = z.infer<typeof sendReminderSchema>;
export type AddTaskInput = z.infer<typeof addTaskSchema>;
