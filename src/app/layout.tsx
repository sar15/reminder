import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeadlineShield",
  description: "Compliance Risk Mitigation Platform for Indian CA Firms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
