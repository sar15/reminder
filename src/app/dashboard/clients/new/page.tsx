"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import type { ComplianceType } from "@/types";

const ALL_COMPLIANCE_TYPES: ComplianceType[] = [
  "GSTR1", "GSTR3B", "GSTR9",
  "TDS_PAYMENT", "TDS_RETURN_24Q", "TDS_RETURN_26Q",
  "ADVANCE_TAX", "ITR_NON_AUDIT", "ITR_AUDIT", "TAX_AUDIT_3CD",
  "AOC4", "MGT7", "DIR3_KYC", "MSME1", "PF", "ESI", "LLP_FORM11",
];

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    pan: "",
    gstin: "",
    cin: "",
    preferred_language: "en",
    compliance_types: [] as ComplianceType[],
  });

  function toggleCompliance(type: ComplianceType) {
    setForm((f) => ({
      ...f,
      compliance_types: f.compliance_types.includes(type)
        ? f.compliance_types.filter((t) => t !== type)
        : [...f.compliance_types, type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.compliance_types.length === 0) {
      setError("Select at least one compliance type.");
      return;
    }
    setLoading(true);
    setError("");

    // Get current user's firm_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setLoading(false); return; }

    const { data: userData } = await supabase
      .from("users")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    if (!userData?.firm_id) { setError("Firm not found"); setLoading(false); return; }

    const { error: insertError } = await supabase.from("clients").insert({
      ...form,
      firm_id: userData.firm_id,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/dashboard/clients");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Name *" required>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Sharma Enterprises Pvt Ltd"
            />
          </Field>
          <Field label="Contact Person">
            <input
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="input"
              placeholder="Rajesh Sharma"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="rajesh@sharma.com"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="PAN">
            <input
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              className="input"
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </Field>
          <Field label="GSTIN">
            <input
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
              className="input"
              placeholder="27ABCDE1234F1Z5"
            />
          </Field>
          <Field label="CIN (if company)">
            <input
              value={form.cin}
              onChange={(e) => setForm({ ...form, cin: e.target.value })}
              className="input"
              placeholder="U12345MH2020PTC123456"
            />
          </Field>
          <Field label="Preferred Language">
            <select
              value={form.preferred_language}
              onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
              className="input"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
              <option value="mr">Marathi</option>
              <option value="ta">Tamil</option>
            </select>
          </Field>
        </div>

        {/* Compliance types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Compliances *
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_COMPLIANCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleCompliance(type)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  form.compliance_types.includes(type)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {formatComplianceType(type)}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Client"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          ring: 2px solid #6366f1;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
