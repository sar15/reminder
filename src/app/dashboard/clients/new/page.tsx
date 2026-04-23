"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import type { ComplianceType } from "@/types";
import Link from "next/link";

const ALL_TYPES: ComplianceType[] = [
  "GSTR1","GSTR3B","GSTR9",
  "TDS_PAYMENT","TDS_RETURN_24Q","TDS_RETURN_26Q",
  "ADVANCE_TAX","ITR_NON_AUDIT","ITR_AUDIT","TAX_AUDIT_3CD",
  "AOC4","MGT7","DIR3_KYC","MSME1","PF","ESI","LLP_FORM11",
];

const CLIENT_PRESETS: Record<string, { label: string; types: ComplianceType[] }> = {
  sme_gst: {
    label: "SME (GST registered)",
    types: ["GSTR1","GSTR3B","TDS_PAYMENT","ADVANCE_TAX","ITR_NON_AUDIT"],
  },
  company: {
    label: "Private Limited Company",
    types: ["GSTR1","GSTR3B","TDS_PAYMENT","TDS_RETURN_26Q","ITR_AUDIT","AOC4","MGT7","DIR3_KYC"],
  },
  individual: {
    label: "Individual / Proprietor",
    types: ["ITR_NON_AUDIT","ADVANCE_TAX"],
  },
  llp: {
    label: "LLP",
    types: ["GSTR1","GSTR3B","TDS_PAYMENT","ITR_AUDIT","LLP_FORM11"],
  },
};

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ComplianceType[]>([]);
  const [form, setForm] = useState({
    name: "", contact_name: "", email: "", phone: "",
    pan: "", gstin: "", cin: "", preferred_language: "en",
  });

  function applyPreset(key: string) {
    setSelectedTypes(CLIENT_PRESETS[key].types);
  }

  function toggleType(t: ComplianceType) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTypes.length === 0) { alert("Select at least one compliance type."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard/clients");
  }

  return (
    <div style={{ padding: 28, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/dashboard/clients" style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#fff", border: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", fontSize: 16, color: "#374151",
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Add New Client</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Fill in details and select applicable compliances</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Client Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { key: "name",         label: "Business Name *",    placeholder: "Sharma Enterprises Pvt Ltd", required: true },
              { key: "contact_name", label: "Contact Person",     placeholder: "Rajesh Sharma" },
              { key: "email",        label: "Email",              placeholder: "rajesh@sharma.com",          type: "email" },
              { key: "phone",        label: "Phone",              placeholder: "+91 98765 43210" },
              { key: "pan",          label: "PAN",                placeholder: "ABCDE1234F",                 upper: true },
              { key: "gstin",        label: "GSTIN",              placeholder: "27ABCDE1234F1Z5",            upper: true },
              { key: "cin",          label: "CIN (if company)",   placeholder: "U12345MH2020PTC123456" },
            ].map(({ key, label, placeholder, required, type, upper }) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {label}
                </label>
                <input
                  type={type ?? "text"}
                  required={required}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: upper ? e.target.value.toUpperCase() : e.target.value })}
                  style={{
                    width: "100%", border: "1px solid #e5e7eb", borderRadius: 7,
                    padding: "9px 12px", fontSize: 13, color: "#111827",
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Preferred Language
              </label>
              <select
                value={form.preferred_language}
                onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 7, padding: "9px 12px", fontSize: 13 }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
                <option value="mr">Marathi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compliance types */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Applicable Compliances</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            Quick-select by client type, or pick individually below.
          </div>

          {/* Presets */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {Object.entries(CLIENT_PRESETS).map(([key, preset]) => (
              <button key={key} type="button" onClick={() => applyPreset(key)} style={{
                border: "1px solid #e5e7eb", background: "#f9fafb",
                borderRadius: 7, padding: "7px 14px",
                fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer",
              }}>
                {preset.label}
              </button>
            ))}
          </div>

          {/* Individual toggles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_TYPES.map((t) => {
              const isSelected = selectedTypes.includes(t);
              return (
                <button key={t} type="button" onClick={() => toggleType(t)} style={{
                  border: `1px solid ${isSelected ? "#4f46e5" : "#e5e7eb"}`,
                  background: isSelected ? "#4f46e5" : "#fff",
                  color: isSelected ? "#fff" : "#374151",
                  borderRadius: 7, padding: "6px 12px",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>
                  {formatComplianceType(t)}
                </button>
              );
            })}
          </div>

          {selectedTypes.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#4f46e5" }}>
              {selectedTypes.length} compliance type{selectedTypes.length > 1 ? "s" : ""} selected
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading} style={{
            background: loading ? "#a5b4fc" : "#4f46e5", color: "#fff",
            border: "none", borderRadius: 8, padding: "11px 24px",
            fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Saving..." : "Add Client"}
          </button>
          <Link href="/dashboard/clients" style={{
            border: "1px solid #e5e7eb", background: "#fff",
            color: "#374151", borderRadius: 8, padding: "11px 24px",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
