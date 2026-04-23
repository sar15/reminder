"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const IS_MOCK =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url";

export default function LoginPage() {
  const router = useRouter();

  // Demo mode — just go straight to dashboard
  if (IS_MOCK) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full space-y-6 text-center">
          <div className="text-4xl">🛡️</div>
          <h1 className="text-2xl font-bold text-gray-900">CA Compliance Shield</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-left">
            <strong>Demo Mode</strong> — running with sample data.
            <br />
            No Supabase setup needed to explore the UI.
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Enter Dashboard →
          </button>
          <p className="text-xs text-gray-400">
            To use real data, add your Supabase keys to{" "}
            <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return <RealLoginPage />;
}

function RealLoginPage() {
  const router = useRouter();

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    alert(`Magic link sent to ${email}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">CA Compliance Shield</h1>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="partner@yourfirm.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Send Magic Link
          </button>
        </form>
      </div>
    </div>
  );
}
