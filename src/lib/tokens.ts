// Design tokens — single source of truth
export const T = {
  // Backgrounds
  bgBase:    "#FAFAF9",
  bgSurface: "#FFFFFF",
  bgSubtle:  "#F5F5F4",
  bgMuted:   "#F0EFED",

  // Borders
  border:       "#E8E6E3",
  borderStrong: "#D6D3CF",

  // Text
  text1: "#1C1917",   // primary
  text2: "#57534E",   // secondary
  text3: "#A8A29E",   // tertiary
  text4: "#D6D3CF",   // disabled

  // Brand — warm violet
  brand:      "#6D28D9",
  brandHover: "#5B21B6",
  brandLight: "#EDE9FE",
  brandBorder:"#DDD6FE",
  brandText:  "#5B21B6",

  // Red
  red:       "#DC2626",
  redLight:  "#FEF2F2",
  redBorder: "#FECACA",
  redText:   "#991B1B",

  // Amber
  amber:       "#D97706",
  amberLight:  "#FFFBEB",
  amberBorder: "#FDE68A",
  amberText:   "#92400E",

  // Green
  green:       "#059669",
  greenLight:  "#ECFDF5",
  greenBorder: "#A7F3D0",
  greenText:   "#065F46",

  // Blue
  blue:       "#2563EB",
  blueLight:  "#EFF6FF",
  blueBorder: "#BFDBFE",
  blueText:   "#1E40AF",

  // Shadows
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08)",

  // Radius
  r: "8px",
  rLg: "12px",
  rXl: "16px",
} as const;

// Reusable style objects
export const S = {
  card: {
    background: "#FFFFFF",
    border: "1px solid #E8E6E3",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  } as React.CSSProperties,

  label: {
    fontSize: 10,
    fontWeight: 600,
    color: "#A8A29E",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,

  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#6D28D9",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(109,40,217,0.3)",
  } as React.CSSProperties,

  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#FFFFFF",
    color: "#1C1917",
    border: "1px solid #E8E6E3",
    borderRadius: "8px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  input: {
    width: "100%",
    border: "1px solid #E8E6E3",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: 13,
    color: "#1C1917",
    background: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
} as const;
