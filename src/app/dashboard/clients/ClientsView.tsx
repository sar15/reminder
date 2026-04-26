"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientTable } from "@/components/clients/ClientTable";
import { Modal } from "@/components/shared/Modal";
import { AddClientForm } from "@/components/clients/AddClientForm";
import { BulkImportForm } from "@/components/clients/BulkImportForm";
import { Plus, Upload } from "lucide-react";
import type { Client, ComplianceTask } from "@/types";

interface ClientsViewProps {
  initialClients: Client[];
  initialTasks: ComplianceTask[];
  firmId?: string;
}

export function ClientsView({ initialClients, initialTasks, firmId }: ClientsViewProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const handleSuccess = () => {
    setAddModalOpen(false);
    setImportModalOpen(false);
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 40px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
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
            Clients
          </h1>
          <p style={{ fontSize: 13, color: "#9B9B9B" }}>
            {initialClients.length} client{initialClients.length !== 1 ? "s" : ""} · manage, import, and send reminders
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setImportModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "#fff",
              border: "1px solid #E5E2DB",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B6B6B",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#F3F1EC";
              (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "#fff";
              (e.currentTarget as HTMLElement).style.color = "#6B6B6B";
            }}
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "#1A1A1A",
              border: "1px solid #1A1A1A",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      <ClientTable clients={initialClients} tasks={initialTasks} />

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Client"
        description="Add a single client. Compliance tasks are auto-generated from the calendar."
        maxWidth="max-w-2xl"
      >
        <AddClientForm onSuccess={handleSuccess} onCancel={() => setAddModalOpen(false)} firmId={firmId} />
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import"
        description="Upload a CSV or Excel file to add multiple clients at once."
        maxWidth="max-w-3xl"
      >
        <BulkImportForm onSuccess={handleSuccess} onCancel={() => setImportModalOpen(false)} firmId={firmId} />
      </Modal>
    </div>
  );
}
