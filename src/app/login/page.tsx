"use client";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
      <div className="w-full max-w-[900px] grid grid-cols-[1fr_400px] gap-12 items-center">

        {/* Left — value */}
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#6D28D9] flex items-center justify-center">
              <Shield size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold text-[#1C1917] tracking-tight">DeadlineShield</span>
          </div>

          <h1 className="text-[36px] font-bold text-[#1C1917] leading-[1.15] tracking-tight mb-4">
            Stop getting blamed<br />for penalties you<br />
            <span className="text-[#6D28D9]">didn't cause.</span>
          </h1>

          <p className="text-[15px] text-[#57534E] leading-relaxed mb-8 max-w-[420px]">
            Built for Indian CA firms. Automated reminders, document collection,
            and timestamped legal proof — all in one place.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🛡️", text: "Court-admissible proof of every reminder sent" },
              { icon: "📱", text: "Client magic link portal — no login, no friction" },
              { icon: "🔴", text: "Risk heatmap — focus only on critical clients" },
              { icon: "📄", text: "One-click Liability Report PDF for ICAI disputes" },
              { icon: "🔒", text: "1-to-1 only — no CC, no BCC, no privacy breach" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-[16px]">{f.icon}</span>
                <span className="text-[13px] text-[#57534E]">{f.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#A8A29E] mt-8">
            Rs.1,050/month total infra cost · Profitable with 1 paying customer
          </p>
        </div>

        {/* Right — login card */}
        <div className="bg-white rounded-2xl border border-[#E8E6E3] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#1C1917] mb-1">Welcome back</h2>
          <p className="text-[13px] text-[#A8A29E] mb-6">Sign in to your firm dashboard</p>

          {/* Demo */}
          <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-4 mb-5">
            <p className="text-[11px] font-semibold text-[#92400E] mb-1">⚡ Demo Mode</p>
            <p className="text-[12px] text-[#78350F] mb-3 leading-relaxed">
              No setup needed. Explore with 5 real-looking CA clients and the full workflow.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#6D28D9] text-white text-[13px] font-semibold hover:bg-[#5B21B6] transition-colors shadow-[0_1px_4px_rgba(109,40,217,0.3)]"
            >
              Enter Demo Dashboard <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#F0EFED]" />
            <span className="text-[11px] text-[#A8A29E]">or sign in with email</span>
            <div className="flex-1 h-px bg-[#F0EFED]" />
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="partner@yourfirm.com"
              className="w-full border border-[#E8E6E3] rounded-lg px-4 py-2.5 text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#6D28D9] transition-colors"
            />
            <button className="w-full py-2.5 rounded-lg bg-[#F5F5F4] border border-[#E8E6E3] text-[#57534E] text-[13px] font-medium hover:bg-[#E8E6E3] transition-colors">
              Send Magic Link
            </button>
          </div>

          <p className="text-[11px] text-[#A8A29E] text-center mt-4">
            No password needed · Secure link sent to your email
          </p>

          {/* Demo portal links */}
          <div className="mt-6 pt-5 border-t border-[#F0EFED]">
            <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2.5">Demo Client Portals</p>
            <div className="space-y-1.5">
              {[
                { token: "demo-sharma", name: "Sharma Enterprises (Critical)" },
                { token: "demo-patel",  name: "Patel Constructions (Critical)" },
                { token: "demo-reddy",  name: "Reddy Tech Solutions (On Track)" },
              ].map(({ token, name }) => (
                <a key={token} href={`/portal/${token}`} className="flex items-center gap-1.5 text-[12px] text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
                  <ArrowRight size={11} /> {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
