"use client";

import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import Link from "next/link";
import { useRiskAssessments } from "@/lib/hooks";
import {
  Users,
  AlertTriangle,
  AlertCircle,
  Clock,
  Filter,
  Download,
  Sparkles,
} from "lucide-react";

const fallbackStudents = [
  {
    id: "asif-iqbal",
    name: "Asif Iqbal",
    avatar: "AI",
    studentId: "20057033",
    intervention: "Nov 2025",
    status: "Tier 3",
    statusClass: "bg-rose-100 text-rose-600",
  },
  {
    id: "mark-vien",
    name: "Mark Vien",
    avatar: "MV",
    studentId: "20057022",
    intervention: "Nov 2025",
    status: "Tier 3",
    statusClass: "bg-rose-100 text-rose-600",
  },
  {
    id: "sarah-lopez",
    name: "Sarah Lopez",
    avatar: "SL",
    studentId: "20057023",
    intervention: "Oct 2025",
    status: "Tier 2",
    statusClass: "bg-amber-100 text-amber-600",
  },
  {
    id: "david-kim",
    name: "David Kim",
    avatar: "DK",
    studentId: "20057051",
    intervention: "Nov 2025",
    status: "Tier 1",
    statusClass: "bg-slate-100 text-slate-600",
  },
];

const departments = [
  { name: "Humanities", value: 62, color: "bg-rose-500" },
  { name: "STEM", value: 38, color: "bg-blue-500" },
  { name: "Arts", value: 24, color: "bg-amber-400" },
];

function tierFor(reasons: string[]) {
  if (reasons.length >= 3) return { status: "Tier 3" as const, statusClass: "bg-rose-100 text-rose-600" };
  if (reasons.length === 2) return { status: "Tier 2" as const, statusClass: "bg-amber-100 text-amber-600" };
  return { status: "Tier 1" as const, statusClass: "bg-slate-100 text-slate-600" };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AtRiskStudentsPage() {
  const PAGE_SIZE = 25; // synced with backend REST_FRAMEWORK.PAGE_SIZE
  const [weekFilter, setWeekFilter] = useState<"all" | 4 | 8>("all");
  const [tierFilter, setTierFilter] = useState<"all" | "Tier 1" | "Tier 2" | "Tier 3">("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data } = useRiskAssessments({
    isAtRisk: true,
    week: weekFilter === "all" ? undefined : weekFilter,
    page,
  });

  useEffect(() => {
    setPage(1);
  }, [weekFilter]);

  const students = useMemo(() => {
    if (!data?.results?.length) return fallbackStudents;
    const seen = new Set<string>();
    const rows: Array<{
      id: string;
      name: string;
      avatar: string;
      studentId: string;
      intervention: string;
      status: "Tier 1" | "Tier 2" | "Tier 3";
      statusClass: string;
    }> = [];
    for (const ra of data.results) {
      if (seen.has(ra.studentId)) continue;
      seen.add(ra.studentId);
      const tier = tierFor(ra.reasons);
      rows.push({
        id: slug(ra.studentName),
        name: ra.studentName,
        avatar: initials(ra.studentName),
        studentId: ra.studentId,
        intervention: new Date(ra.evaluatedAt).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        status: tier.status,
        statusClass: tier.statusClass,
      });
    }
    return rows;
  }, [data]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (tierFilter !== "all" && s.status !== tierFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    });
  }, [students, tierFilter, search]);

  function exportCsv() {
    const headers = ["Student Name", "Student ID", "Intervention", "Status"];
    const rows = filteredStudents.map((s) => [s.name, s.studentId, s.intervention, s.status]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `at-risk-students-${weekFilter === "all" ? "all-weeks" : `week-${weekFilter}`}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const totalAtRisk = data?.count ?? 142;
  const totalPages = Math.max(1, Math.ceil(totalAtRisk / PAGE_SIZE));
  const tier3 = data?.results.filter((r) => r.reasons.length >= 3).length ?? 28;
  const tier2 = data?.results.filter((r) => r.reasons.length === 2).length ?? 54;
  const tier1 = data?.results.filter((r) => r.reasons.length === 1).length ?? 60;

  const stats = [
    {
      label: "Total At-Risk",
      sub: "+23 from last month",
      value: String(totalAtRisk),
      icon: Users,
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      label: "Tier 3",
      sub: "Requires immediate action",
      value: String(tier3),
      icon: AlertTriangle,
      bg: "bg-rose-50",
      fg: "text-rose-500",
    },
    {
      label: "Tier 2",
      sub: "Early warning indicators",
      value: String(tier2),
      icon: AlertCircle,
      bg: "bg-amber-50",
      fg: "text-amber-500",
    },
    {
      label: "Tier 1",
      sub: "Monitoring status",
      value: String(tier1),
      icon: Clock,
      bg: "bg-slate-100",
      fg: "text-slate-500",
    },
  ];

  return (
    <AppShell
      headerLeftBadge={
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-rose-500">
          <span className="flex h-2 w-2 items-center justify-center">
            <span className="h-2 w-2 animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-rose-500" />
          </span>
          System Audit · High Priority
        </span>
      }
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            At-Risk Students
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive overview of students requiring immediate intervention.
            Tiered based on academic performance, attendance, and behavioral
            indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, sub, value, icon: Icon, bg, fg }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400">
                  {label}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${fg}`}
                >
                  <Icon size={13} />
                </span>
              </div>
              <div className="mt-3 text-3xl font-bold text-slate-900">
                {value}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Student Intervention List
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Filter size={12} />
                Filter
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Download size={12} />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
              <label className="text-xs font-medium text-slate-600">
                Week
                <select
                  value={String(weekFilter)}
                  onChange={(e) =>
                    setWeekFilter(e.target.value === "all" ? "all" : (Number(e.target.value) as 4 | 8))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                >
                  <option value="all">All Weeks</option>
                  <option value="4">Week 4</option>
                  <option value="8">Week 8</option>
                </select>
              </label>

              <label className="text-xs font-medium text-slate-600">
                Tier
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as "all" | "Tier 1" | "Tier 2" | "Tier 3")}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                >
                  <option value="all">All Tiers</option>
                  <option value="Tier 3">Tier 3</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 1">Tier 1</option>
                </select>
              </label>

              <label className="text-xs font-medium text-slate-600">
                Search
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or Student ID"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400"
                />
              </label>
            </div>
          )}

          <table className="mt-5 w-full">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 text-left">Student Name</th>
                <th className="py-3 text-left">Student ID</th>
                <th className="py-3 text-left">Intervention</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700">
                        {s.avatar}
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-500">{s.studentId}</td>
                  <td className="py-4 text-sm text-slate-500">
                    <div>{s.intervention}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Last Review
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.statusClass}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/at-risk-students/${s.id}`}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-xs text-slate-400">
            Showing page {page} of {totalPages} · {filteredStudents.length} rows on this page · {totalAtRisk} total at-risk students
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-800">
              Tier 1 Concentration By Department
            </h3>
            <div className="mt-5 space-y-4">
              {departments.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{d.name}</span>
                    <span className="text-slate-500">{d.value}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${d.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-900 p-6 text-white">
            <h3 className="text-base font-semibold">
              Automated Intervention Status
            </h3>
            <p className="mt-2 max-w-md text-xs text-white/75">
              Smart triggers have scheduled 16 meetings for tomorrow based on
              Tier 1 priority shifts.
            </p>
            <button className="mt-5 rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 hover:bg-slate-100">
              Review Schedule
            </button>
            <Sparkles
              size={120}
              className="absolute -right-4 -bottom-4 text-white/10"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
