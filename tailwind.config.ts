import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#fafafa",
        surface: "#ffffff",
        border: {
          DEFAULT: "#e5e7eb",
          hover: "#d1d5db",
        },
        text: {
          primary: "#111827",
          secondary: "#6b7280",
          muted: "#9ca3af",
        },
        accent: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          light: "#eff6ff",
        },
        danger: {
          DEFAULT: "#dc2626",
          bg: "#fef2f2",
          border: "#fecaca",
          text: "#991b1b",
        },
        warning: {
          DEFAULT: "#d97706",
          bg: "#fffbeb",
          border: "#fde68a",
          text: "#92400e",
        },
        success: {
          DEFAULT: "#059669",
          bg: "#ecfdf5",
          border: "#a7f3d0",
          text: "#065f46",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0,0,0,0.03)",
        DEFAULT: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["15px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "2xl": ["22px", { lineHeight: "30px", letterSpacing: "-0.02em" }],
        "3xl": ["26px", { lineHeight: "34px", letterSpacing: "-0.02em" }],
        "4xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.03em" }],
      },
    },
  },
};

export default config;
