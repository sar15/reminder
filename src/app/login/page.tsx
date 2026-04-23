"use client";

import { useRouter } from "next/navigation";
import { Shield, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-700 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">ComplianceShield</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Stop getting blamed for<br />penalties you didn't cause.
            </h2>
            <p className="text-indigo-200 mt-3 text-sm leading-relaxed">
              Timestamped, court-admissible proof of every reminder sent.
              Built for Indian CA firms managing 50–500 clients.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Personalized 1-to-1 reminders — never CC'd",
              "Immutable audit trail for every communication",
              "One-click Liability Report PDF for disputes",
              "Client magic link portal — no login needed",
              "Risk heatmap — focus only on critical clients",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle size={14} className="text-indigo-300 flex-shrink-0" />
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-xs">
          Profitable with 1 paying customer · Rs.1,050/month total infra cost
        </p>
      </div>

      {/* Right — login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-7">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Shield size={20} className="text-indigo-400" />
            <span className="text-white font-bold">ComplianceShield</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your firm dashboard</p>
          </div>

          {/* Demo mode entry */}
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-semibold mb-1">⚡ Demo Mode Active</p>
              <p className="text-slate-400 text-xs">
                No setup needed. Click below to explore with sample CA firm data.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-500 transition"
            >
              Enter Demo Dashboard →
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs text-slate-500">or sign in with email</span>
            </div>
          </div>

          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="partner@yourfirm.com"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full bg-slate-700 text-slate-300 py-3 rounded-xl font-medium text-sm hover:bg-slate-600 transition"
            >
              Send Magic Link
            </button>
          </form>

          <p className="text-xs text-slate-600 text-center">
            No password needed · Magic link sent to your email
          </p>
        </div>
      </div>
    </div>
  );
}
