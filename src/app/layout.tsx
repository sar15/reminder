import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeadlineShield — CA Compliance Platform",
  description: "Never miss a compliance deadline. Protect your practice with timestamped proof.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
