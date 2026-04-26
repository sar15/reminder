"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Upload, Camera, X, Loader2 } from "lucide-react";

interface Props {
  token: string;
  taskId: string;
  accentColor: string;
}

interface UploadedFile {
  name: string;
  size: number;
  preview?: string;
}

export default function PortalUpload({ token, taskId, accentColor }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [files, setFiles]     = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      name: f.name,
      size: f.size,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("token",   token);
      fd.append("task_id", taskId);

      // Collect from both inputs
      const allInputFiles: File[] = [];
      if (fileRef.current?.files)   allInputFiles.push(...Array.from(fileRef.current.files));
      if (cameraRef.current?.files) allInputFiles.push(...Array.from(cameraRef.current.files));

      if (allInputFiles.length === 0) {
        // Files were staged but inputs were cleared (e.g. user re-opened picker)
        // This is a real error — tell the user to re-select
        setError("Please re-select your files and try again.");
        setUploading(false);
        return;
      }

      allInputFiles.forEach((f) => fd.append("files", f));

      const res  = await fetch("/api/portal/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Upload failed. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-3">
          <CheckCircle2 size={24} className="text-[#059669]" />
        </div>
        <div className="text-[14px] font-bold text-[#111827] mb-1">Documents Uploaded!</div>
        <div className="text-[12px] text-[#6b7280]">
          Your CA has been notified. Task status updated to Docs Received.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] px-3 py-2"
            >
              {f.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt={f.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-[#eff6ff] flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-[#2563eb]">
                  {f.name.split(".").pop()?.toUpperCase().slice(0, 3) ?? "FILE"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[#111827] truncate">{f.name}</div>
                <div className="text-[10px] text-[#9ca3af]">
                  {(f.size / 1024).toFixed(0)} KB
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="w-5 h-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#dc2626] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[8px] text-white text-[13px] font-semibold transition-colors"
          style={{ background: accentColor }}
        >
          <Camera size={15} />
          Camera
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[8px] text-[13px] font-semibold border-[1.5px] bg-white transition-colors"
          style={{ color: accentColor, borderColor: accentColor }}
        >
          <Upload size={15} />
          Upload File
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {error && (
        <div className="text-[12px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-[6px] px-3 py-2">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={submit}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[#059669] text-white text-[13px] font-bold hover:bg-[#047857] disabled:opacity-60 transition-colors"
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Uploading…</>
          ) : (
            <>Submit {files.length} Document{files.length > 1 ? "s" : ""}</>
          )}
        </button>
      )}
    </div>
  );
}
