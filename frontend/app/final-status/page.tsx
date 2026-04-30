"use client";

import { useMemo } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useConsolidatedReport } from "@/lib/hooks";
import { Filter, Download } from "lucide-react";

const fallbackLedger = [
  {
    name: "Asif Iqbal",
    avatar: "AI",
    color: "bg-amber-100 text-amber-700",
    studentId: "20057033",
    date: "Jan 12, 2026",
    status: "Resolved",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Mark Vien",
    avatar: "MV",
    color: "bg-blue-100 text-blue-700",
    studentId: "20057022",
    date: "Jan 15, 2026",
    status: "Pending",
    statusClass: "bg-amber-50 text-amber-600",
  },
  {
    name: "Guta Bahadur",
    avatar: "GB",
    color: "bg-rose-100 text-rose-700",
    studentId: "20057017",
    date: "Feb 02, 2026",
    status: "Resolved",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Linda Steart",
    avatar: "LS",
    color: "bg-violet-100 text-violet-700",
    studentId: "20057041",
    date: "Feb 11, 2026",
    status: "Resolved",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Scott Lee",
    avatar: "SL",
    color: "bg-emerald-100 text-emerald-700",
    studentId: "20057068",
    date: "Feb 24, 2026",
    status: "Resolved",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
];

const palette = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FinalStatusPage() {
  const { data } = useConsolidatedReport();

  const total = data ? data.count : 1248;
  const pending = data
    ? data.results.filter((r) => r.subjectsAtRiskW8 > 0).length
    : 12;

  const ledger = useMemo(() => {
    if (!data?.results?.length) return fallbackLedger;
    return data.results.slice(0, 5).map((row, i) => {
      const resolved =
        row.subjectsAtRiskW4 > 0 && row.subjectsAtRiskW8 < row.subjectsAtRiskW4;
      const pendingRow = row.subjectsAtRiskW8 > 0;
      const status = resolved ? "Resolved" : pendingRow ? "Pending" : "Resolved";
      const statusClass =
        status === "Pending"
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600";
      return {
        name: row.studentName,
        avatar: initials(row.studentName),
        color: palette[i % palette.length],
        studentId: row.studentId,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status,
        statusClass,
      };
    });
  }, [data]);

  return (
    <AppShell searchPlaceholder="Search report...">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Final Status Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Periodic comprehensive periodic outcomes and remediation roadblocks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Report Summary
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <div className="text-xs text-slate-500">Total Processed</div>
                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {total.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Pending Reviews</div>
                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {pending}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <div className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  SIGN OFF
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Student Ledger
              </h3>
              <div className="flex gap-2 text-slate-400">
                <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50">
                  <Filter size={13} />
                </button>
                <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50">
                  <Download size={13} />
                </button>
              </div>
            </div>

            <table className="mt-5 w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 text-left">Student Name</th>
                  <th className="py-3 text-left">Student ID</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((l) => (
                  <tr key={l.studentId}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${l.color}`}
                        >
                          {l.avatar}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {l.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {l.studentId}
                    </td>
                    <td className="py-4 text-sm text-slate-500">{l.date}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${l.statusClass}`}
                      >
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {ledger.length} of {total.toLocaleString()} entries
              </span>
              <div className="flex gap-2">
                <button className="rounded-md border border-slate-200 px-3 py-1 font-semibold hover:bg-slate-50">
                  Previous
                </button>
                <button className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-brand-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
