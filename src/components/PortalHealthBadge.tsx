// Portal health — in production this would poll GST/IT portal status
// For demo: simulate based on day of month (20th = yellow, otherwise green)

export default function PortalHealthBadge() {
  const day = new Date().getDate();
  const isWarning = day >= 18 && day <= 22;
  const isDown = false; // would come from real API

  const status = isDown ? "down" : isWarning ? "slow" : "stable";

  const config = {
    stable: { dot: "#10b981", label: "GST Portal: Stable", sub: "Safe to file now", bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    slow:   { dot: "#f59e0b", label: "GST Portal: Slow",   sub: "File within 6 hrs", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    down:   { dot: "#ef4444", label: "GST Portal: Down",   sub: "Contact support",   bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  }[status];

  return (
    <div style={{
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 8,
      padding: "8px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 7, height: 7,
          borderRadius: "50%",
          background: config.dot,
          display: "inline-block",
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: config.text }}>{config.label}</span>
      </div>
      <div style={{ fontSize: 10, color: config.text, opacity: 0.7, marginTop: 2, paddingLeft: 13 }}>
        {config.sub}
      </div>
    </div>
  );
}
