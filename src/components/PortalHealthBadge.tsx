// Portal health — in production this would poll GST/IT portal status
// For demo: simulate based on day of month (18-22 = slow, otherwise stable)

export default function PortalHealthBadge() {
  const day = new Date().getDate();
  const isWarning = day >= 18 && day <= 22;
  const status = isWarning ? "slow" : "stable";

  const config = {
    stable: { dot: "#00875A", label: "GST Portal: Stable", sub: "Safe to file now",  bg: "#E3FCEF", border: "#A3E6C8", text: "#00875A" },
    slow:   { dot: "#FF8B00", label: "GST Portal: Slow",   sub: "File within 6 hrs", bg: "#FFF3E0", border: "#FFD591", text: "#FF8B00" },
    down:   { dot: "#DE350B", label: "GST Portal: Down",   sub: "Contact support",   bg: "#FFEBE6", border: "#FFBDAD", text: "#DE350B" },
  }[status];

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 8,
        padding: "7px 11px",
        display: "inline-flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: config.dot, display: "inline-block", flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: config.text, fontFamily: "'DM Sans', sans-serif" }}>
          {config.label}
        </span>
      </div>
      <div style={{ fontSize: 10, color: config.text, opacity: 0.7, paddingLeft: 12, fontFamily: "'DM Sans', sans-serif" }}>
        {config.sub}
      </div>
    </div>
  );
}
