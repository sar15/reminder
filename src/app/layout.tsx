import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeadlineShield — CA Compliance Platform",
  description: "Compliance Risk Mitigation Platform for Indian CA Firms. Timestamped, court-admissible proof of every client communication.",
  keywords: ["CA compliance", "GST filing", "TDS", "Indian CA firm", "compliance management"],
  authors: [{ name: "DeadlineShield" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
