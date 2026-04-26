"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message);
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E5E2DB",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: "#1A1A1A",
    background: "#FAF9F7",
    outline: "none",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF9F7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Subtle mesh */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          background: "radial-gradient(ellipse, rgba(45,91,255,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 48 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "#1A1A1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: 4,
              border: "1.5px solid #2D5BFF",
              opacity: 0.7,
            }}
          />
          <Shield size={14} color="#fff" style={{ position: "relative", zIndex: 1 }} />
        </div>
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 500,
            fontSize: 18,
            color: "#1A1A1A",
            letterSpacing: "-0.03em",
          }}
        >
          Deadline<span style={{ color: "#2D5BFF" }}>Shield</span>
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 400,
              fontSize: 26,
              color: "#1A1A1A",
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: "#9B9B9B" }}>Sign in to your firm dashboard.</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#9B9B9B",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 7,
              }}
            >
              Email
            </label>
            <input
              required type="email" placeholder="partner@yourfirm.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = "#2D5BFF";
                e.target.style.boxShadow = "0 0 0 3px rgba(45,91,255,0.08)";
                e.target.style.background = "#fff";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#E5E2DB";
                e.target.style.boxShadow = "none";
                e.target.style.background = "#FAF9F7";
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#9B9B9B",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 7,
              }}
            >
              Password
            </label>
            <input
              required type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = "#2D5BFF";
                e.target.style.boxShadow = "0 0 0 3px rgba(45,91,255,0.08)";
                e.target.style.background = "#fff";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#E5E2DB";
                e.target.style.boxShadow = "none";
                e.target.style.background = "#FAF9F7";
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#FFEBE6",
                border: "1px solid #FFBDAD",
                borderRadius: 8,
                fontSize: 13,
                color: "#DE350B",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "13px",
              background: "#1A1A1A",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {loading && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid #EDEBE6",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#9B9B9B" }}>
            New here?{" "}
            <Link href="/signup" style={{ color: "#2D5BFF", fontWeight: 600, textDecoration: "none" }}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo portals */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#C5C2BB",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Demo portals
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {[
              { token: "demo-sharma", name: "Sharma Ent." },
              { token: "demo-patel",  name: "Patel Const." },
            ].map(({ token, name }) => (
              <a
                key={token}
                href={`/portal/${token}`}
                style={{
                  padding: "6px 12px",
                  background: "#F3F1EC",
                  border: "1px solid #E5E2DB",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B6B6B",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "#EDF0FF";
                  (e.currentTarget as HTMLElement).style.color = "#2D5BFF";
                  (e.currentTarget as HTMLElement).style.borderColor = "#C0CCFF";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "#F3F1EC";
                  (e.currentTarget as HTMLElement).style.color = "#6B6B6B";
                  (e.currentTarget as HTMLElement).style.borderColor = "#E5E2DB";
                }}
              >
                {name} →
              </a>
            ))}
            <a
              href="/dashboard/demo"
              style={{
                padding: "6px 12px",
                background: "#EDF0FF",
                border: "1px solid #C0CCFF",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 600,
                color: "#2D5BFF",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#2D5BFF";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "#EDF0FF";
                (e.currentTarget as HTMLElement).style.color = "#2D5BFF";
              }}
            >
              Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
