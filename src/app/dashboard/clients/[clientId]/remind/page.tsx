"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { sendReminder } from "@/app/actions/sendReminder";
import { formatComplianceType } from "@/lib/utils";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function RemindPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const router = useRouter();
  const supabase = createClient();

  const [client, setClient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [cadence, setCadence] = useState("T-3");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("clients").select("*").eq("id", clientId).single();
      const { data: t } = await supabase
        .from("compliance_tasks")
        .select("*")
        .eq("client_id", clientId)
        .neq("status", "filed")
        .order("due_date");
      setClient(c);
      setTasks(t ?? []);
      if (t && t.length > 0) setSelectedTask(t[0].id);
    }
    load();
  }, [clientId, supabase]);

  async function handleSend() {
    if (!selectedTask) return;
    setLoading(true);
    const result = await sendReminder(selectedTask, cadence);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/clients/${clientId}`), 1500);
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  if (!client) return <div className="p-6">Loading...</div>;

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Reminder Sent</h2>
        <p className="text-gray-600">
          Personalized reminder sent to <strong>{client.email}</strong> and logged in the audit trail.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/clients/${clientId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Reminder</h1>
          <p className="text-gray-500 text-sm">{client.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Task</label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {formatComplianceType(task.compliance_type)} · {task.period} · Due: {task.due_date}
              </option>
            ))}
          </select>
          {tasks.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">No pending tasks for this client.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Type</label>
          <div className="flex gap-2">
            {["T-10", "T-7", "T-3", "T-1", "T+1"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  cadence === c
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            T-3 = 3 days before due date · T-1 = Final warning · T+1 = Overdue notice
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-800">
          <strong>What happens:</strong> A personalized, 1-to-1 email will be sent to{" "}
          <strong>{client.email ?? "this client"}</strong> with the compliance details and due date.
          The exact timestamp, message ID, and delivery status will be logged in the immutable audit trail.
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={loading || !selectedTask || !client.email}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Sending..." : "Send Reminder"}
          </button>
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>

        {!client.email && (
          <p className="text-red-600 text-sm">⚠️ This client has no email address. Add one to send reminders.</p>
        )}
      </div>
    </div>
  );
}
