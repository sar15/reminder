"use client";

import { useState, useMemo } from "react";
import type { Client, ComplianceTask } from "@/types";
import { ClientRow } from "./ClientRow";
import { getRiskLevel } from "@/lib/utils";

interface ClientTableProps {
  clients: Client[];
  tasks: ComplianceTask[];
}

export function ClientTable({ clients, tasks }: ClientTableProps) {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const byClient = useMemo(() => {
    return tasks.reduce<Record<string, ComplianceTask[]>>((acc, t) => {
      (acc[t.client_id] ??= []).push(t);
      return acc;
    }, {});
  }, [tasks]);

  const enriched = useMemo(() => {
    return clients.map(c => {
      const clientTasks = byClient[c.id] || [];
      return { ...c, tasks: clientTasks, risk: getRiskLevel(clientTasks.filter(t => t.status !== "filed")) };
    });
  }, [clients, byClient]);

  const filtered = useMemo(() => {
    return enriched.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.pan && c.pan.toLowerCase().includes(search.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
      const matchRisk = filterRisk === "all" ? true : c.risk === filterRisk;
      return matchSearch && matchRisk;
    });
  }, [enriched, search, filterRisk]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, PAN, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            border: "1px solid #E5E2DB",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "#1A1A1A",
            background: "#FAF9F7",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={e => { e.target.style.borderColor = "#2D5BFF"; e.target.style.background = "#fff"; }}
          onBlur={e => { e.target.style.borderColor = "#E5E2DB"; e.target.style.background = "#FAF9F7"; }}
        />
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          style={{
            border: "1px solid #E5E2DB",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "#6B6B6B",
            background: "#FAF9F7",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          <option value="all">All clients</option>
          <option value="red">Critical</option>
          <option value="yellow">Attention</option>
          <option value="green">On Track</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#fff",
            border: "1px solid #E5E2DB",
            borderRadius: 16,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>No clients found</p>
          <p style={{ fontSize: 12, color: "#9B9B9B" }}>
            {search ? `No results for "${search}"` : "Add your first client to get started."}
          </p>
        </div>
      ) : (
        filtered.map(client => (
          <ClientRow key={client.id} client={client} tasks={client.tasks} />
        ))
      )}
    </div>
  );
}
