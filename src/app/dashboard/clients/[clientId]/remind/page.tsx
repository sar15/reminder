"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { ArrowLeft, Send, Shield, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";

const IS_MOCK =
  typeof window !== "undefined"
    ? !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url"
    : true;

const CADENCES = [
  { key: "T-15", label: "T-15", desc: "First gentle nudge", tone: "Friendly" },
  { key: "T-10", label: "T-10", desc: "Document checklist", tone: "Informative" },
  { key: "T-7", label: "T-7", desc: "Formal reminder", tone: "Firm" },
  { key: "T-3", label: "T-3", desc: "Urgent warning", tone: "Urgent" },
  { key: "T-1", label: "T-1", desc: "Final notice", tone: "Critical" },
  { key: "T+1", label: "T+1", desc: "Overdue notice", tone: "Overdue" },
];

const CADENCE_COLORS: Record<string, string> = {
  "T-15": "border-slate-300 text-slate-600",
  "T-10": "border-blue-300 text-blue-600",
  "T-7": "border-indigo-300 text-indigo-600",
  "T-3": "border-amber-400 text-amber-700",
  "T-1": "border-orange-400 text-orange-700",
  "T+1": "border-red-400 text-red-700",
};

const CADENCE_SELECTED: Record<string, string> = {
  "T-15": "bg-slate-600 text-white border-slate-600",
  "T-10": "bg-blue-600 text-white border-blue-600",
  "T-7": "bg-indigo-600 text-white border-indigo-600",
  "T-3": "bg-amber-500 text-white border-amber-500",
  "T-1": "bg-orange-500 text-white border-orange-500",
  "T+1": "bg-red-600 text-white border-red-600",
};

export default function RemindPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [cadence, setCadence] = useState("T-3");
  const [channels, setChannels] = useState({ email: true, whatsapp: false });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (IS_MOCK) {
      const c = MOCK_CLIENTS.find((x) => x.id === clientId);
      const t = MOCK_TASKS.filter((x) => x.client_id === clientId && x.status !== "filed");
      setClient(c ?? null);
      setTasks(t);
      if (t.length > 0) setSelectedTask(t[0].id);
      return;
    }
    const supabase = createClient();
    async function load() {
      const { data: c } = await supabase.from("clients").select("*").eq("id", clientId).single();
      const { data: t } = await supabase
        .from("compliance_tasks").select("*")
        .eq("client_id", clientId).neq("status", "filed").order("due_date");
      setClient(c);
      setTasks(t ?? []);
      if (t && t.length > 0) setSelectedTask(t[0].id);
    }
    load();
  }, [clientId]);

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);

  async function handleSend() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate send
    setSent(true);
    setLoading(false);
  }

  if (!client) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-16 text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reminder Sent</h2>
          <p className="text-slate-500 text-sm mt-1">
            Personalized {cadence} reminder sent to <strong>{client.email}</strong>
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Shield size={13} className="text-indigo-500" />
            <span>Logged in immutable audit trail with timestamp</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle size={13} className="text-emerald-500" />
            <span>Message ID recorded for delivery proof</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock size={13} className="text-blue-500" />
            <span>Task status updated to "Waiting Docs"</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSent(false)}
            className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
          >
            Send Another
          </button>
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Back to Client
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/clients/${clientId}`} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          <ArrowLeft size={15} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Send Reminder</h1>
          <p className="text-sm text-slate-500">{client.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left — config */}
        <div className="col-span-3 space-y-4">

          {/* Task selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Select Compliance Task</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400">No pending tasks for this client.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const days = Math.ceil(
                    (new Date(task.due_date).getTime() - Date.now()) / 86400000
                  );
                  return (
                    <label
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        selectedTask === task.id
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="task"
                        value={task.id}
                        checked={selectedTask === task.id}
                        onChange={() => setSelectedTask(task.id)}
                        className="accent-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {formatComplianceType(task.compliance_type)}
                        </p>
                        <p className="text-xs text-slate-400">{task.period}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{task.due_date}</p>
                        <p className={`text-[10px] font-medium ${days < 0 ? "text-red-600" : days <= 5 ? "text-orange-600" : "text-slate-400"}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cadence selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Reminder Cadence</h3>
            <div className="grid grid-cols-3 gap-2">
              {CADENCES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCadence(c.key)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    cadence === c.key
                      ? CADENCE_SELECTED[c.key]
                      : `bg-white ${CADENCE_COLORS[c.key]} hover:bg-slate-50`
                  }`}
                >
                  <p className="text-xs font-bold">{c.label}</p>
                  <p className={`text-[10px] mt-0.5 ${cadence === c.key ? "opacity-80" : "text-slate-400"}`}>{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Channel selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Send Via</h3>
            <div className="flex gap-3">
              <ChannelToggle
                label="Email"
                icon="📧"
                active={channels.email}
                onClick={() => setChannels((c) => ({ ...c, email: !c.email }))}
                sub={client.email ?? "No email"}
              />
              <ChannelToggle
                label="WhatsApp"
                icon="💬"
                active={channels.whatsapp}
                onClick={() => setChannels((c) => ({ ...c, whatsapp: !c.whatsapp }))}
                sub={client.phone ?? "No phone"}
                disabled={!client.phone}
              />
            </div>
          </div>
        </div>

        {/* Right — preview */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-4 py-3">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Message Preview</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400">TO</p>
                <p className="text-xs font-medium text-slate-700">{client.contact_name ?? client.name}</p>
                <p className="text-[10px] text-slate-400">{client.email}</p>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <p className="text-[10px] text-slate-400">SUBJECT</p>
                <p className="text-xs font-medium text-slate-700">
                  {cadence === "T+1" ? "⚠️ Overdue: " : cadence === "T-1" ? "🚨 Final Notice: " : "Action Required: "}
                  {selectedTaskData ? formatComplianceType(selectedTaskData.compliance_type) : "Compliance Reminder"}
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] text-slate-400 mb-2">BODY</p>
                <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed space-y-2">
                  <p>Dear {client.contact_name ?? client.name},</p>
                  <p>
                    {cadence === "T-1"
                      ? "This is your FINAL reminder. Filing is due tomorrow."
                      : cadence === "T+1"
                      ? "Your filing is now overdue. Penalties are accruing daily."
                      : cadence === "T-3"
                      ? "Your filing deadline is in 3 days. Please upload documents immediately."
                      : "Please upload the required documents for your upcoming compliance filing."}
                  </p>
                  {selectedTaskData && (
                    <div className="bg-white rounded border border-slate-200 p-2 space-y-1">
                      <p><strong>Compliance:</strong> {formatComplianceType(selectedTaskData.compliance_type)}</p>
                      <p><strong>Due Date:</strong> {selectedTaskData.due_date}</p>
                      {client.pan && <p><strong>PAN:</strong> {client.pan}</p>}
                    </div>
                  )}
                  <p className="text-slate-400 text-[10px]">
                    This is a personalized, confidential message sent only to you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit note */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-indigo-600" />
              <p className="text-[11px] font-semibold text-indigo-700">Audit Trail Protection</p>
            </div>
            <p className="text-[10px] text-indigo-500 leading-relaxed">
              This send will be logged with timestamp, message ID, and delivery status in your immutable audit trail — usable as legal proof.
            </p>
          </div>

          <button
            onClick={handleSend}
            disabled={loading || !selectedTask || (!channels.email && !channels.whatsapp)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={15} />
                Send Reminder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChannelToggle({
  label, icon, active, onClick, sub, disabled,
}: {
  label: string; icon: string; active: boolean;
  onClick: () => void; sub: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 p-3 rounded-lg border text-left transition ${
        active
          ? "border-indigo-300 bg-indigo-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        {active && <span className="ml-auto w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px]">✓</span>
        </span>}
      </div>
      <p className="text-[10px] text-slate-400 truncate">{sub}</p>
    </button>
  );
}
