"use client";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useAllRiskAssessments, useConsolidatedReport, useNotifications } from "@/lib/hooks";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Mail,
} from "lucide-react";

export default function DashboardPage() {
  const { data: report, loading, error, refetch } = useConsolidatedReport();
  const { data: assessments } = useAllRiskAssessments({ isAtRisk: true });
  const { data: notifications } = useNotifications();

  const total = report ? report.count.toLocaleString() : "0";
  const atRiskW4 = report
    ? report.results.filter((r) => r.subjectsAtRiskW4 > 0).length.toString()
    : "0";
  const atRiskW8 = report
    ? report.results.filter((r) => r.subjectsAtRiskW8 > 0).length.toString()
    : "0";
  const improved = report
    ? report.results
        .filter((r) => r.subjectsAtRiskW4 > 0 && r.subjectsAtRiskW8 < r.subjectsAtRiskW4)
        .length.toString()
    : "0";
  const atRiskW4Count = Number(atRiskW4);
  const atRiskW8Count = Number(atRiskW8);
  const trendBars = [
    { week: "W4", count: atRiskW4Count, color: "bg-amber-400" },
    { week: "W8", count: atRiskW8Count, color: "bg-rose-400" },
  ];
  const maxTrend = Math.max(1, ...trendBars.map((b) => b.count));

  const subjectBuckets = new Map<string, number>();
  for (const ra of assessments ?? []) {
    subjectBuckets.set(ra.subjectName, (subjectBuckets.get(ra.subjectName) ?? 0) + 1);
  }
  const subjectRows = Array.from(subjectBuckets.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxSubject = Math.max(1, ...subjectRows.map((s) => s.count));

  const recentNotifications = (notifications?.results ?? []).slice(0, 3).map((n) => ({
    title: `Notification to ${n.studentName}`,
    sub: n.message.slice(0, 70),
    time: new Date(n.created_at).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: n.status.toUpperCase(),
  }));

  const stats = [
    {
      label: "Total Students",
      value: total,
      sub: "+2.4% from last semester",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      accent: "bg-white/10",
    },
    {
      label: "At Risk Week 4",
      value: atRiskW4,
      sub: "Students flagged in Week 4",
      icon: TrendingUp,
      color: "from-amber-400 to-amber-500",
      accent: "bg-white/10",
    },
    {
      label: "At Risk Week 8",
      value: atRiskW8,
      sub: "Students flagged in Week 8",
      icon: AlertTriangle,
      color: "from-rose-400 to-rose-500",
      accent: "bg-white/10",
    },
    {
      label: "Improved Students",
      value: improved,
      sub: "Improved from Week 4 to Week 8",
      icon: Sparkles,
      color: "from-emerald-500 to-emerald-600",
      accent: "bg-white/10",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Institutional Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time risk analytics and student health metrics.
          </p>
          {loading && (
            <p className="mt-2 text-xs font-medium text-blue-600">Loading real data...</p>
          )}
          {error && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <span>Unable to load dashboard data from API.</span>
              <button
                onClick={refetch}
                className="rounded-md border border-rose-300 px-2 py-1 font-semibold hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon, color, accent }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-soft`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
                  {label}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}
                >
                  <Icon size={14} />
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold tracking-tight">
                {value}
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-white/85">
                <TrendingUp size={11} />
                <span>{sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Risk Distribution Trend
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Week 4 vs Week 8 at-risk student counts
                </p>
              </div>
            </div>

            <div className="mt-8 flex h-56 items-end gap-6">
              {trendBars.map((b) => {
                return (
                  <div
                    key={b.week}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className={`w-full rounded-t-md transition ${b.color}`}
                      style={{ height: `${Math.max(18, (b.count / maxTrend) * 180)}px` }}
                    />
                    <span className="text-xs font-semibold text-slate-700">{b.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-3">
              {trendBars.map((b) => (
                <div
                  key={b.week}
                  className="flex flex-1 justify-center text-[10px] font-medium text-slate-400"
                >
                  {b.week}
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col p-6">
            <h3 className="text-base font-semibold text-slate-900">
              Subject-wise Risk
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              At-risk assessment concentration by subject
            </p>

            <div className="mt-6 space-y-5">
              {subjectRows.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-slate-500">{s.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.max(8, (s.count / maxSubject) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {subjectRows.length === 0 && (
                <div className="text-sm text-slate-500">No at-risk subject data yet.</div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold text-slate-900">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentNotifications.map(
              ({ title, sub, time, status }) => (
                <Card
                  key={title + time}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {title}
                      </div>
                      <div className="text-xs text-slate-500">{sub}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{time}</div>
                    <div className="text-[10px] font-bold tracking-wider text-slate-600">
                      {status}
                    </div>
                  </div>
                </Card>
              )
            )}
            {recentNotifications.length === 0 && (
              <Card className="p-4 text-sm text-slate-500">No recent notification activity.</Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
