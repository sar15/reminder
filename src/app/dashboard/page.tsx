import { getAuthenticatedUser } from "@/lib/auth";
import { getClients, getAllTasks, getAllAuditLogsForClient } from "@/lib/data";
import { KPIStrip } from "@/components/command-center/KPIStrip";
import { ActionList } from "@/components/command-center/ActionList";
import { WeekCalendar } from "@/components/command-center/WeekCalendar";
import { ActivityFeed } from "@/components/command-center/ActivityFeed";
import type { AuditLog } from "@/types";

export default async function DashboardPage() {
  const auth = await getAuthenticatedUser();
  const firmId = auth?.firmId;

  const [clients, tasks] = await Promise.all([getClients(firmId), getAllTasks(firmId)]);

  const activeClients = clients.slice(0, 10);
  const logsArrays = await Promise.all(activeClients.map(c => getAllAuditLogsForClient(c.id, firmId)));
  const allLogs = logsArrays.flat() as AuditLog[];

  // Determine greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  return (
    <div style={{ padding: "40px 40px 48px", maxWidth: 1320, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 400,
            fontSize: 32,
            color: "#1A1A1A",
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          {greeting}
        </h1>
        <p style={{ fontSize: 14, color: "#9B9B9B", fontWeight: 400 }}>
          {auth ? `Here's your compliance overview for today, ${auth.partnerName || auth.email}.` : "Here's your compliance overview for today."}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ marginBottom: 32 }}>
        <KPIStrip tasks={tasks} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left — urgent actions */}
        <div style={{ height: 520 }}>
          <ActionList tasks={tasks} clients={clients} />
        </div>

        {/* Right — stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, height: 520 }}>
          <div style={{ height: 160, flexShrink: 0 }}>
            <WeekCalendar tasks={tasks} />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ActivityFeed logs={allLogs} clients={clients} />
          </div>
        </div>
      </div>
    </div>
  );
}
