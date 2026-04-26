"use client";

import { useState } from "react";
import { updateMasterCalendar, createComplianceType } from "./actions";
import { Calendar, Save, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";

type CalendarEvent = {
  id: string;
  compliance_type: string;
  standard_due_date: string;
  updated_due_date: string | null;
  is_extended: boolean;
};

export function MasterCalendar({ calendar }: { calendar: CalendarEvent[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDate, setNewTypeDate] = useState("");
  const [newTypeFreq, setNewTypeFreq] = useState("monthly");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(type: string) {
    if (!newDate) return;
    setLoading(true);
    setSuccess(null);
    setError(null);

    const result = await updateMasterCalendar(type, newDate);
    
    setLoading(false);
    if (result.success) {
      setSuccess(`Extended due date cascaded to all pending ${type} tasks.`);
      setEditingId(null);
    } else {
      setError(result.error || "Failed to update calendar.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTypeName || !newTypeDate) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    const result = await createComplianceType(newTypeName, newTypeDate, newTypeFreq);
    
    setLoading(false);
    if (result.success) {
      setSuccess(`Successfully added custom compliance: ${newTypeName.toUpperCase()}`);
      setShowAddForm(false);
      setNewTypeName("");
      setNewTypeDate("");
    } else {
      setError(result.error || "Failed to create new compliance type.");
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-sm overflow-hidden mb-6 transition-all">
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#3b82f6]" />
          <div>
            <h2 className="text-[14px] font-bold text-[#0f172a]">Universal Master Calendar</h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">Update once here, auto-updates all client tasks</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[12px] font-bold hover:bg-blue-100 transition-colors"
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? "Cancel" : "Add Custom Form"}
        </button>
      </div>
      
      {success && (
        <div className="mx-5 mt-4 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <span className="text-[13px] text-emerald-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="mx-5 mt-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-[13px] text-red-800">{error}</span>
        </div>
      )}

      {showAddForm && (
        <div className="mx-5 mt-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
          <h3 className="text-[13px] font-bold text-[#0f172a] mb-3">Add New Compliance Requirement</h3>
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-[#64748b] mb-1">Form/Tax Name</label>
              <input 
                required placeholder="e.g. NEW_GST_GSTR9"
                value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
                className="w-full text-[13px] border border-[#cbd5e1] rounded-md px-3 py-2 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#64748b] mb-1">Due Date</label>
              <input 
                required type="date"
                value={newTypeDate} onChange={e => setNewTypeDate(e.target.value)}
                className="text-[13px] border border-[#cbd5e1] rounded-md px-3 py-2 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#64748b] mb-1">Frequency</label>
              <select 
                value={newTypeFreq} onChange={e => setNewTypeFreq(e.target.value)}
                className="text-[13px] border border-[#cbd5e1] rounded-md px-3 py-2 focus:outline-none focus:border-[#3b82f6] bg-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button 
              type="submit" disabled={loading}
              className="bg-[#0f172a] text-white px-4 py-2 rounded-md text-[13px] font-bold hover:bg-[#1e293b] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Rule"}
            </button>
          </form>
        </div>
      )}

      <div className="p-5">
        <div className="space-y-3">
          {calendar.map((event) => {
            const activeDate = event.updated_due_date || event.standard_due_date;
            const isEditing = editingId === event.id;

            return (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] hover:border-[#e2e8f0] transition-colors">
                <div>
                  <div className="text-[13px] font-bold text-[#0f172a] font-mono mb-1">{event.compliance_type}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${event.is_extended ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-700"}`}>
                      {event.is_extended ? "Extended" : "Standard"}
                    </span>
                    <span className="text-[13px] text-[#475569]">
                      Due: <strong className="text-[#0f172a]">{new Date(activeDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input 
                        type="date" 
                        value={newDate} 
                        onChange={e => setNewDate(e.target.value)}
                        className="text-[13px] border border-[#cbd5e1] rounded-md px-2 py-1.5 focus:outline-none focus:border-[#3b82f6]"
                      />
                      <button 
                        onClick={() => handleSave(event.compliance_type)}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-[#0f172a] text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-[#1e293b]"
                      >
                        {loading ? "..." : <><Save size={14} /> Save</>}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-[12px] text-[#64748b] hover:text-[#0f172a] font-medium px-2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingId(event.id);
                        setNewDate(activeDate);
                        setSuccess(null);
                      }}
                      className="text-[12px] font-bold text-[#3b82f6] hover:text-[#2563eb] bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-md shadow-sm hover:border-[#3b82f6]/30 transition-all"
                    >
                      Extend Deadline
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
