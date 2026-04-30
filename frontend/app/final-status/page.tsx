"use client";

import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useAllRiskAssessments, useUpdateRiskStatus } from "@/lib/hooks";
import { Filter, Download, Search, ClipboardList, Users, Clock3, CheckCircle2 } from "lucide-react";

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
  const PAGE_SIZE = 10;
  const { data, loading, error, refetch } = useAllRiskAssessments({ week: 8 });
  const { run: updateStatus } = useUpdateRiskStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | "At Risk" | "Improving" | "Resolved">("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  const totalAssessmentRows = data?.length ?? 0;
  const uniqueStudentCount = useMemo(() => {
    const ids = new Set((data ?? []).map((r) => r.studentId));
    return ids.size;
  }, [data]);
  const reviewedCount = (data ?? []).filter((r) => r.stillAtRiskWeek9 !== null).length;
  const pendingReviewCount = totalAssessmentRows - reviewedCount;

  const ledger = useMemo(() => {
    const rows = (data ?? []).map((ra, i) => {
      const status = ra.currentStatus || "At Risk";
      const statusClass =
        status.toLowerCase().includes("resolved")
          ? "bg-emerald-50 text-emerald-600"
          : status.toLowerCase().includes("improv")
          ? "bg-blue-50 text-blue-600"
          : "bg-amber-50 text-amber-600";
      return {
        id: ra.id,
        name: ra.studentName,
        avatar: initials(ra.studentName),
        color: palette[i % palette.length],
        studentId: ra.studentId,
        subjectCode: ra.subjectCode,
        subjectName: ra.subjectName,
        date: new Date(ra.evaluatedAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status,
        stillAtRiskWeek9: ra.stillAtRiskWeek9,
        statusClass,
      };
    });
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q);
    });
  }, [data, search, statusFilter]);

  const pagedLedger = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return ledger.slice(start, start + PAGE_SIZE);
  }, [ledger, page]);

  const totalPages = Math.max(1, Math.ceil(ledger.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  async function saveWeek9(rowId: number, status: string, stillAtRiskWeek9: boolean | null) {
    setSavingIds((prev) => new Set(prev).add(rowId));
    try {
      await updateStatus(rowId, { currentStatus: status, stillAtRiskWeek9 });
      refetch();
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  }

  function exportCsv() {
    const headers = ["Student Name", "Student ID", "Week 8 Evaluated", "Current Status", "Still At Risk Week 9"];
    const rows = ledger.map((l) => [l.name, l.studentId, l.date, l.status, l.stillAtRiskWeek9 === null ? "" : l.stillAtRiskWeek9 ? "Yes" : "No"]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "final-status-week8-week9.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
          <p className="mt-1 text-xs text-slate-400">
            One row = one student + one subject (Week 8 assessment).
          </p>
          {loading && <p className="mt-2 text-xs font-medium text-blue-600">Loading final status data...</p>}
          {error && <p className="mt-2 text-xs font-medium text-rose-600">Failed to load final status data.</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Assessment Rows (W8)
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList size={15} />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{totalAssessmentRows.toLocaleString()}</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unique Students
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users size={15} />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{uniqueStudentCount.toLocaleString()}</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Week 9 Pending
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock3 size={15} />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{pendingReviewCount.toLocaleString()}</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Week 9 Reviewed
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={15} />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{reviewedCount.toLocaleString()}</div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Report Summary</div>
              <div className="mt-1 text-sm text-slate-600">
                Live Week 8 assessment rows with Week 9 review tracking status.
              </div>
            </div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
              LIVE
            </span>
          </div>
        </Card>

        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Student Ledger
              </h3>
              <div className="flex gap-2 text-slate-400">
                <button
                  className={`rounded-lg border p-1.5 hover:bg-slate-50 ${
                    showFilters ? "border-brand-200 bg-brand-50 text-brand-600" : "border-slate-200"
                  }`}
                  onClick={() => setShowFilters((v) => !v)}
                  title="Show/Hide filters"
                >
                  <Filter size={13} />
                </button>
                <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" onClick={exportCsv}>
                  <Download size={13} />
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="relative md:col-span-2">
                <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or student ID"
                  className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm text-slate-700"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "At Risk" | "Improving" | "Resolved")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="At Risk">At Risk</option>
                <option value="Improving">Improving</option>
                <option value="Resolved">Resolved</option>
              </select>
              </div>
            )}

            <table className="mt-5 w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 text-left">Student Name</th>
                  <th className="py-3 text-left">Student ID</th>
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Week 9</th>
                  <th className="py-3 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedLedger.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
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
                    <td className="py-4 text-sm">
                      <div className="font-semibold text-slate-700">{l.subjectCode}</div>
                      <div className="text-xs text-slate-500">{l.subjectName}</div>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-600">{l.date}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${l.statusClass}`}
                      >
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-700">
                      {l.stillAtRiskWeek9 === null ? "Not Reviewed" : l.stillAtRiskWeek9 ? "Yes" : "No"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={savingIds.has(l.id)}
                          onClick={() => void saveWeek9(l.id, "Improving", true)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {savingIds.has(l.id) ? "Saving..." : "Improving"}
                        </button>
                        <button
                          disabled={savingIds.has(l.id)}
                          onClick={() => void saveWeek9(l.id, "Resolved", false)}
                          className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                        >
                          {savingIds.has(l.id) ? "Saving..." : "Resolved"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !error && pagedLedger.length === 0 && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No records found for current filters.
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {page} of {totalPages} - {pagedLedger.length} rows on this page - {ledger.length} filtered entries
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
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
