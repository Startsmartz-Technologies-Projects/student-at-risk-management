"use client";

import { useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useUploadStudents } from "@/lib/hooks";
import {
  CloudUpload,
  Info,
  CheckCircle2,
  FileText,
  Download,
  Trash2,
  BarChart3,
} from "lucide-react";

const guidelines = [
  "Sheet students: student_id, full_name, email, enrolled_at",
  "Optional sheets: subjects, enrollments, metrics",
  "Metrics week must be 4 or 8",
  "Accepted formats: .xlsx or .xls",
  "Max file size: 10MB",
];

const fallbackUploads = [
  { name: "Trimester_3_2025.xlsx", size: "14.2 MB", date: "Nov 2025" },
  { name: "Trimester_2_2025.xlsx", size: "12.8 MB", date: "Aug 2025" },
  { name: "Annual_Review_2024.xlsx", size: "44.5 MB", date: "Dec 2024" },
];

export default function UploadDataPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { run: upload, loading } = useUploadStudents();
  const [uploads, setUploads] = useState(fallbackUploads);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleUpload(file: File) {
    try {
      setStatus(null);
      const result = await upload(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const date = new Date().toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      setUploads((prev) => [{ name: file.name, size: sizeMb, date }, ...prev]);
      setStatus({
        type: "success",
        text:
          `Upload successful. Students C/U: ${result.created}/${result.updated} | ` +
          `Subjects C/U: ${result.subjectsCreated ?? 0}/${result.subjectsUpdated ?? 0} | ` +
          `Enrollments C: ${result.enrollmentsCreated ?? 0} | ` +
          `Metrics C/U: ${result.metricsCreated ?? 0}/${result.metricsUpdated ?? 0}`,
      });
    } catch (e: unknown) {
      const fallback = "Upload failed. Use .xlsx/.xls (<=10MB) and valid column format.";
      if (e && typeof e === "object" && "data" in e) {
        const data = (e as { data?: unknown }).data;
        if (typeof data === "string") {
          setStatus({ type: "error", text: data });
          return;
        }
        if (data && typeof data === "object" && "file" in data) {
          const msg = (data as { file?: string[] }).file?.[0];
          setStatus({ type: "error", text: msg ?? fallback });
          return;
        }
      }
      setStatus({ type: "error", text: fallback });
    }
  }

  return (
    <AppShell searchPlaceholder="Search data points...">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingest new student records to refresh risk intelligence models.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="border-2 border-dashed border-slate-200 bg-white p-12 text-center lg:col-span-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CloudUpload size={26} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-800">
              Drag and drop your dataset
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Your files will be securely processed and encrypted.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              <CloudUpload size={15} />
              Upload File
            </button>
            <div className="mt-3 text-[10px] font-bold tracking-widest text-brand-600">
              SUPPORTS .XLSX / .XLS FILES
            </div>
            {status && (
              <div
                className={`mt-4 rounded-lg px-3 py-2 text-xs font-medium ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {status.text}
              </div>
            )}
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Info size={15} className="text-brand-600" />
                Formatting Guide
              </div>
              <ul className="mt-4 space-y-2.5">
                {guidelines.map((g) => (
                  <li
                    key={g}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2
                      size={13}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    {g}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/85">
                System Health
              </div>
              <div className="mt-2 text-2xl font-bold">Active</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                Processing Engine V2.4
              </div>
              <BarChart3
                size={48}
                className="absolute right-4 bottom-3 text-white/20"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Previous Uploads
            </h3>
            <button className="text-xs font-semibold text-brand-600 hover:underline">
              View History
            </button>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 text-left">File Name</th>
                  <th className="px-6 py-3 text-left">Upload Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploads.map((u) => (
                  <tr key={u.name + u.date}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FileText size={15} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-400">{u.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {u.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                        Processed
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button className="hover:text-slate-700">
                          <Download size={15} />
                        </button>
                        <button className="hover:text-rose-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
