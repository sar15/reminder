"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, ChevronRight } from "lucide-react";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E5E2DB",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14,
  color: "#1A1A1A",
  background: "#FAF9F7",
  outline: "none",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#2D5BFF";
  e.target.style.boxShadow = "0 0 0 3px rgba(45,91,255,0.1)";
  e.target.style.background = "#fff";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#E5E2DB";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#FAF9F7";
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firm_name: "", partner_name: "", email: "", password: "", confirm_password: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { firm_name: form.firm_name, partner_name: form.partner_name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) { setError(signUpError.message); return; }
      setStep("verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#FAF9F7", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <div
          className="text-center max-w-[400px] w-full"
          style={{ background: "#fff", border: "1px solid #E5E2DB", borderRadius: 24, padding: "48px 40px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 text-[28px]"
            style={{ background: "#E3FCEF", border: "1px solid #A3E6C8" }}
          >
            📧
          </div>
          <h2
            className="text-[22px] mb-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: "#1A1A1A", letterSpacing: "-0.025em" }}
          >
            Check your email
          </h2>
          <p className="text-[13px] mb-1" style={{ color: "#9B9B9B" }}>We sent a confirmation link to</p>
          <p className="text-[14px] font-semibold mb-6" style={{ color: "#1A1A1A" }}>{form.email}</p>
          <div
            className="text-[12px] mb-7 p-4 rounded-[10px]"
            style={{ background: "#F3F1EC", border: "1px solid #E5E2DB", color: "#6B6B6B", lineHeight: 1.7 }}
          >
            Click the link in the email to activate your account. Check spam if you don&apos;t see it within 2 minutes.
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: "#2D5BFF" }}
          >
            Back to login <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#FAF9F7", fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Mesh */}
      <div className="absolute pointer-events-none" style={{ top: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(ellipse at center, rgba(45,91,255,0.07) 0%, transparent 70%)" }} />

      <div className="w-full max-w-[460px] relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center relative flex-shrink-0" style={{ background: "#1A1A1A" }}>
            <div className="absolute inset-[4px] rounded-[5px]" style={{ border: "1.5px solid #2D5BFF", opacity: 0.7 }} />
            <Shield size={14} className="text-white relative z-10" />
          </div>
          <span className="text-[18px] tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: "#1A1A1A" }}>
            Deadline<span style={{ color: "#2D5BFF" }}>Shield</span>
          </span>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E5E2DB", borderRadius: 24, padding: "40px 36px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
          <div className="mb-7">
            <h1 className="text-[22px] mb-1.5" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: "#1A1A1A", letterSpacing: "-0.025em" }}>
              Create your firm account
            </h1>
            <p className="text-[13px]" style={{ color: "#9B9B9B" }}>Set up the compliance OS for your practice.</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {[
              { label: "Firm Name", key: "firm_name", placeholder: "M. Sharma & Associates", type: "text" },
              { label: "Partner Name", key: "partner_name", placeholder: "CA Mahesh Sharma", type: "text" },
              { label: "Work Email", key: "email", placeholder: "partner@yourfirm.com", type: "email" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#9B9B9B" }}>
                  {label}
                </label>
                <input
                  required type={type} placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={INPUT_STYLE}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Password", key: "password", placeholder: "Min. 8 chars" },
                { label: "Confirm", key: "confirm_password", placeholder: "Repeat" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#9B9B9B" }}>
                    {label}
                  </label>
                  <input
                    required type="password" placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="px-4 py-3 text-[13px] font-medium rounded-[10px]" style={{ background: "#FFEBE6", border: "1px solid #FFBDAD", color: "#DE350B" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 text-[14px] font-semibold rounded-[10px] transition-all disabled:opacity-50"
              style={{ background: "#1A1A1A", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.16)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"; }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ChevronRight size={15} style={{ opacity: 0.6 }} /></>
              )}
            </button>
          </form>

          <div className="mt-7 text-center" style={{ borderTop: "1px solid #EDEBE6", paddingTop: 24 }}>
            <p className="text-[13px]" style={{ color: "#9B9B9B" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#2D5BFF" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
