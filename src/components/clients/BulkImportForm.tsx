"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkImportProps {
  onSuccess: () => void;
  onCancel: () => void;
  firmId?: string;
}

type Step = "upload" | "review" | "importing" | "done";

interface ParsedRow {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  compliance_types: string[];
}

const KNOWN_TYPES = new Set([
  "GSTR1", "GSTR3B", "GSTR9",
  "TDS_PAYMENT", "TDS_RETURN_24Q", "TDS_RETURN_26Q",
  "ADVANCE_TAX", "ITR_NON_AUDIT", "ITR_AUDIT", "TAX_AUDIT_3CD",
  "AOC4", "MGT7", "DIR3_KYC", "MSME1", "PF", "ESI", "LLP_FORM11",
]);

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function parseComplianceTypes(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|]+/)
    .map(s => s.trim().toUpperCase().replace(/[\s-]+/g, "_"))
    .filter(s => KNOWN_TYPES.has(s));
}

export function BulkImportForm({ onSuccess, onCancel, firmId }: BulkImportProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; failed: number; tasks_created: number } | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

        if (json.length === 0) {
          setError("No data found in the spreadsheet.");
          return;
        }

        // Map headers
        const rows: ParsedRow[] = json.map((row) => {
          const normalized: Record<string, string> = {};
          for (const [key, val] of Object.entries(row)) {
            normalized[normalizeHeader(key)] = String(val).trim();
          }

          return {
            name: normalized.name || normalized.business_name || normalized.client_name || normalized.company_name || "",
            contact_name: normalized.contact_name || normalized.contact_person || normalized.partner_name || "",
            email: normalized.email || normalized.mail || "",
            phone: normalized.phone || normalized.mobile || normalized.contact_number || "",
            pan: (normalized.pan || normalized.pan_number || "").toUpperCase(),
            gstin: (normalized.gstin || normalized.gst || normalized.gst_number || "").toUpperCase(),
            compliance_types: parseComplianceTypes(
              normalized.compliance_types || normalized.compliances || normalized.types || normalized.compliance || ""
            ),
          };
        }).filter(r => r.name.length > 0);

        if (rows.length === 0) {
          setError("No valid rows found. Make sure there's a 'Name' or 'Business Name' column.");
          return;
        }

        setParsedData(rows);
        setStep("review");
      } catch {
        setError("Failed to parse file. Please ensure it's a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const executeImport = async () => {
    setStep("importing");
    setError(null);

    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clients: parsedData,
          auto_generate_tasks: true,
          ...(firmId ? { firm_id: firmId } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Import failed. Please try again.");
        setStep("review");
        return;
      }

      setResult({
        created: data.created ?? parsedData.length,
        failed: data.failed ?? 0,
        tasks_created: data.tasks_created ?? 0,
      });
      setStep("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("review");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between px-8 relative">
        <div className="absolute left-[3.5rem] right-[3.5rem] top-1/2 h-0.5 bg-[#f1f5f9] -z-10 -translate-y-1/2"></div>
        <div className="absolute left-[3.5rem] right-[3.5rem] top-1/2 h-0.5 bg-[#2563eb] -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" style={{ width: step === 'upload' ? '0%' : step === 'review' ? '50%' : '100%' }}></div>
        
        {[
          { id: "upload", label: "Upload CSV" },
          { id: "review", label: "Review Data" },
          { id: "done",   label: "Complete" }
        ].map((s, i) => {
          const isCurrent = step === s.id || (s.id === 'done' && step === 'importing');
          const isPast = ['review', 'importing', 'done'].includes(step) && s.id === 'upload' || ['done'].includes(step) && s.id === 'review';
          
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                isCurrent 
                  ? "bg-[#1d4ed8] text-white shadow-sm ring-4 ring-[#eff6ff]" 
                  : isPast 
                    ? "bg-[#eff6ff] text-[#1d4ed8]" 
                    : "bg-[#f1f5f9] text-[#94a3b8]"
              }`}>
                {isPast ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isCurrent ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#fff1f2] border border-[#fecdd3] rounded-xl text-sm font-medium text-[#be123c] flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="mt-4">
          <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#cbd5e1] rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] hover:border-[#94a3b8] transition-colors cursor-pointer group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-12 h-12 mb-4 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2563eb] group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="mb-2 text-sm font-semibold text-[#0f172a]">Click to upload or drag and drop</p>
              <p className="text-xs text-[#64748b]">CSV or Excel spreadsheet (MAX 5MB)</p>
            </div>
            <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <div className="mt-4 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Expected Columns</div>
            <p className="text-xs text-[#64748b]">
              <strong>Name</strong> (required), Contact Name, Email, Phone, PAN, GSTIN, 
              <strong> Compliance Types</strong> (comma-separated: GSTR1, GSTR3B, TDS_PAYMENT, ITR_AUDIT, etc.)
            </p>
          </div>
          <div className="mt-6 flex justify-end">
             <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white text-[#475569] border border-[#e2e8f0] rounded-xl text-sm font-semibold hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all">
               Cancel
             </button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === "review" && (
        <div className="mt-2">
          <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
              <span className="text-sm font-semibold text-[#0f172a]">Parsed Data</span>
              <span className="text-xs font-semibold text-[#1d4ed8] bg-[#eff6ff] px-2 py-1 rounded-full">{parsedData.length} clients</span>
            </div>
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#64748b] uppercase bg-white border-b border-[#f1f5f9] sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client Name</th>
                    <th className="px-4 py-3 font-semibold">PAN</th>
                    <th className="px-4 py-3 font-semibold">Compliances</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {parsedData.map((row, i) => (
                    <tr key={i} className="bg-white hover:bg-[#f8fafc]">
                      <td className="px-4 py-3 font-medium text-[#0f172a]">{row.name}</td>
                      <td className="px-4 py-3 text-[#64748b] font-mono text-xs">{row.pan || "—"}</td>
                      <td className="px-4 py-3 text-[#64748b]">{row.compliance_types.length > 0 ? `${row.compliance_types.length} types` : "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#f1f5f9] -mx-6 px-6 mb-[-1.5rem] pb-6">
            <button type="button" onClick={executeImport} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-all shadow-sm">
              Confirm & Import All
            </button>
            <button type="button" onClick={() => setStep("upload")} className="px-5 py-3 bg-white text-[#475569] border border-[#e2e8f0] rounded-xl text-sm font-semibold hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all">
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done/Importing */}
      {(step === "importing" || step === "done") && (
        <div className="flex flex-col items-center justify-center py-10 mt-2">
          {step === "importing" ? (
            <>
              <div className="w-16 h-16 border-4 border-[#eff6ff] border-t-[#2563eb] rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-semibold text-[#0f172a] mb-2">Importing Clients...</h3>
              <p className="text-sm text-[#64748b] text-center max-w-xs">Generating compliance tasks and scheduling reminders.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#f0fdf4] text-[#16a34a] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">Import Successful</h3>
              <p className="text-sm text-[#64748b] text-center max-w-xs mb-2">
                <span className="font-semibold text-[#0f172a]">{result?.created ?? parsedData.length} clients</span> imported
                {result?.failed ? <span className="text-[#ea580c]"> ({result.failed} failed)</span> : null}
              </p>
              {result?.tasks_created ? (
                <p className="text-xs text-[#64748b] mb-8">
                  {result.tasks_created} compliance tasks auto-generated
                </p>
              ) : (
                <div className="mb-8" />
              )}
              <button type="button" onClick={onSuccess} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-all shadow-sm">
                View Clients
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
