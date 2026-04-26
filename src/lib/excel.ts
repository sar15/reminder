/**
 * Excel/CSV parser for bulk client import.
 * Uses a spreadsheet parser for Excel files and a resilient CSV parser for text uploads.
 */
import type { ComplianceType, Language } from "@/types";

export interface ParsedClient {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  cin: string;
  compliance_types: ComplianceType[];
  preferred_language: string;
  errors: string[];
}

const COMPLIANCE_ALIASES: Record<string, ComplianceType> = {
  "gstr1": "GSTR1", "gstr-1": "GSTR1", "gst r1": "GSTR1",
  "gstr3b": "GSTR3B", "gstr-3b": "GSTR3B", "gst 3b": "GSTR3B",
  "gstr9": "GSTR9", "gstr-9": "GSTR9",
  "tds": "TDS_PAYMENT", "tds payment": "TDS_PAYMENT",
  "tds 24q": "TDS_RETURN_24Q", "tds24q": "TDS_RETURN_24Q",
  "tds 26q": "TDS_RETURN_26Q", "tds26q": "TDS_RETURN_26Q",
  "advance tax": "ADVANCE_TAX", "advtax": "ADVANCE_TAX",
  "itr": "ITR_NON_AUDIT", "itr non audit": "ITR_NON_AUDIT",
  "itr audit": "ITR_AUDIT",
  "tax audit": "TAX_AUDIT_3CD", "3cd": "TAX_AUDIT_3CD",
  "aoc4": "AOC4", "aoc-4": "AOC4",
  "mgt7": "MGT7", "mgt-7": "MGT7",
  "dir3 kyc": "DIR3_KYC", "dir kyc": "DIR3_KYC",
  "msme": "MSME1", "msme1": "MSME1",
  "pf": "PF", "provident fund": "PF",
  "esi": "ESI",
  "llp": "LLP_FORM11", "llp form 11": "LLP_FORM11",
};

function parseComplianceTypes(raw: string): ComplianceType[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,;|/]/)
        .map((s) => s.trim().toLowerCase())
        .map((s) => COMPLIANCE_ALIASES[s])
        .filter(Boolean) as ComplianceType[]
    )
  );
}

function validatePAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

function validateGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.toUpperCase());
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function sanitizeCell(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, ""));
}

function parseRows(rows: string[][]): ParsedClient[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const col = (row: string[], ...keys: string[]): string => {
    for (const key of keys) {
      const idx = headers.indexOf(key);
      if (idx >= 0) return sanitizeCell(row[idx]);
    }
    return "";
  };

  return rows
    .slice(1)
    .map((row) => {
      const errors: string[] = [];
      const name = col(row, "name", "business_name", "client_name");
      const email = col(row, "email", "email_id");
      const phone = col(row, "phone", "mobile", "contact_number");
      const pan = col(row, "pan", "pan_number").toUpperCase();
      const gstin = col(row, "gstin", "gst_number").toUpperCase();
      const cin = col(row, "cin", "cin_number").toUpperCase();
      const complianceRaw = col(row, "compliance_types", "compliances", "services");
      const preferredLanguage = (col(row, "language", "preferred_language") || "en").toLowerCase();

      if (!name) errors.push("Name is required");
      if (email && !validateEmail(email)) errors.push(`Invalid email: ${email}`);
      if (pan && !validatePAN(pan)) errors.push(`Invalid PAN: ${pan}`);
      if (gstin && !validateGSTIN(gstin)) errors.push(`Invalid GSTIN: ${gstin}`);

      return {
        name,
        contact_name: col(row, "contact_name", "contact", "person"),
        email,
        phone,
        pan,
        gstin,
        cin,
        compliance_types: parseComplianceTypes(complianceRaw),
        preferred_language: preferredLanguage as Language,
        errors,
      };
    })
    .filter((client) =>
      client.name ||
      client.email ||
      client.phone ||
      client.pan ||
      client.gstin ||
      client.compliance_types.length > 0
    );
}

/** Parse CSV text into client rows */
export function parseCSV(text: string): ParsedClient[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return parseRows(lines.map(splitCsvLine));
}

/** Parse either CSV or Excel files into client rows */
export async function parseSpreadsheet(file: File): Promise<ParsedClient[]> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    return parseCSV(await file.text());
  }

  const { read, utils } = await import("xlsx");
  const workbook = read(await file.arrayBuffer(), { type: "array", cellDates: false });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];

  const rows = utils.sheet_to_json<(string | number | boolean | null)[]>(
    workbook.Sheets[firstSheet],
    {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    }
  );

  return parseRows(rows.map((row) => row.map((cell) => sanitizeCell(cell))));
}

/** Generate a sample CSV template for download */
export function generateCSVTemplate(): string {
  const headers = ["name", "contact_name", "email", "phone", "pan", "gstin", "cin", "compliance_types", "language"];
  const sample1 = [
    "Sharma Enterprises Pvt Ltd", "Rajesh Sharma", "rajesh@sharma.com", "+91 98765 43210",
    "ABCDE1234F", "27ABCDE1234F1Z5", "", "GSTR1;GSTR3B;TDS;Advance Tax", "en"
  ];
  const sample2 = [
    "Patel Constructions Ltd", "Amit Patel", "amit@patel.com", "+91 99887 76655",
    "LMNOP9012Q", "24LMNOP9012Q1Z1", "U45200GJ2018PLC102345", "GSTR1;GSTR3B;TDS;ITR Audit;AOC4;MGT7", "en"
  ];

  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;

  return [headers, sample1, sample2]
    .map((row) => row.map(escape).join(","))
    .join("\n");
}
