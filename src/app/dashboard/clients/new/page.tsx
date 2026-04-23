"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import type { ComplianceType } from "@/types";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

const ALL_TYPES: ComplianceType[] = [
  "GSTR1","GSTR3B","GSTR9","TDS_PAYMENT","TDS_RETURN_24Q","TDS_RETURN_26Q",
  "ADVANCE_TAX","ITR_NON_AUDIT","ITR_AUDIT","TAX_AUDIT_3CD",
  "AOC4","MGT7","DIR3_KYC","MSME1","PF","ESI","LLP_FORM11",
];

const PRESETS: Record<string, { label: string; types: ComplianceType[] }> = {
  sme:       { label: "SME (GST registered)",    types: ["GSTR1","GSTR3B","TDS_PAYMENT","ADVANCE_TAX","ITR_NON_AUDIT"] },
  company:   { label: "Private Limited Company", types: ["GSTR1","GSTR3B","TDS_PAYMENT","TDS_RETURN_26Q","ITR_AUDIT","AOC4","MGT7","DIR3_KYC"] },
  individual:{ label: "Individual / Proprietor", types: ["ITR_NON_AUDIT","ADVANCE_TAX"] },
  llp:       { label: "LLP",                     types: ["GSTR1","GSTR3B","TDS_PAYMENT","ITR_AUDIT","LLP_FORM11"] },
};

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ComplianceType[]>([]);
  const [form, setForm] = useState({ name: "", contact_name: "", email: "", phone: "", pan: "", gstin: "", cin: "", preferred_language: "en" });

  function toggle(t: ComplianceType) {
    setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) { alert("Select at least one compliance type."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    router.push("/dashboard/clients");
  }

  return (
    <div style={{ padding: 28, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/dashboard/clients" style={{ ...S.btnSecondary, padding: "7px 10px", fontSize: 16 }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>Add New Client</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 3 }}>Fill in details and select applicable compliances</p>
        </div>
      </div>

      <form onSubmit={submit}>
        {/* Info */}
        <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 16 }}>Client Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { key: "name",         label: "Business Name *",  placeholder: "Sharma Enterprises Pvt Ltd", required: true },
              { key: "contact_name", label: "Contact Person",   placeholder: "Rajesh Sharma" },
              { key: "email",        label: "Email",            placeholder: "rajesh@sharma.com", type: "email" },
              { key: "phone",        label: "Phone",            placeholder: "+91 98765 43210" },
              { key: "pan",          label: "PAN",              placeholder: "ABCDE1234F", upper: true },
              { key: "gstin",        label: "GSTIN",            placeholder: "27ABCDE1234F1Z5", upper: true },
              { key: "cin",          label: "CIN (if company)", placeholder: "U12345MH2020PTC123456" },
            ].map(({ key, label, placeholder, required, type, upper }) => (
              <div key={key}>
                <label style={{ ...S.label, display: "block", marginBottom: 5 }}>{label}</label>
                <input
                  type={type ?? "text"} required={required} placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: upper ? e.target.value.toUpperCase() : e.target.value })}
                  style={S.input}
                />
              </div>
            ))}
            <div>
              <label style={{ ...S.label, display: "block", marginBottom: 5 }}>Preferred Language</label>
              <select value={form.preferred_language} onChange={e => setForm({ ...form, preferred_language: e.target.value })} style={S.input}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
                <option value="mr">Marathi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compliances */}
        <div style={{ ...S.card, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 4 }}>Applicable Compliances</div>
          <div style={{ fontSize: 12, color: T.text3, marginBottom: 14 }}>Quick-select by client type, or pick individually.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} type="button" onClick={() => setSelected(p.types)} style={{ ...S.btnSecondary, fontSize: 12 }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_TYPES.map(t => {
              const on = selected.includes(t);
              return (
                <button key={t} type="button" onClick={() => toggle(t)} style={{
                  padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${on ? T.brand : T.border}`,
                  background: on ? T.brand : T.bgSurface,
                  color: on ? "#fff" : T.text2,
                }}>
                  {formatComplianceType(t)}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ fontSize: 12, color: T.brand, marginTop: 10 }}>{selected.length} compliance type{selected.length > 1 ? "s" : ""} selected</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.5 : 1, padding: "10px 24px", fontSize: 13 }}>
            {loading ? "Saving…" : "Add Client"}
          </button>
          <Link href="/dashboard/clients" style={{ ...S.btnSecondary, padding: "10px 24px", fontSize: 13 }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
