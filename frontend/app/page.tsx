"use client";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useConsolidatedReport } from "@/lib/hooks";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  FileText,
  Activity,
  Mail,
} from "lucide-react";

const fallbackStats = {
  total: "12,482",
  atRiskW4: "432",
  atRiskW8: "218",
  improved: "184",
};

const bars = [
  { week: "WK 01", h: 38 },
  { week: "WK 02", h: 56 },
  { week: "WK 03", h: 70 },
  { week: "WK 04", h: 62 },
  { week: "WK 05", h: 78 },
  { week: "WK 06", h: 92 },
  { week: "WK 07", h: 68 },
  { week: "WK 08", h: 56 },
  { week: "WK 09", h: 44 },
  { week: "WK 10", h: 34 },
];

const subjects = [
  { name: "Computer Science", value: 24, color: "bg-blue-500" },
  { name: "Mathematics", value: 18, color: "bg-teal-500" },
  { name: "Literature & Arts", value: 32, color: "bg-amber-400" },
  { name: "Natural Sciences", value: 12, color: "bg-violet-500" },
];

const activities = [
  {
    icon: FileText,
    title: "Last uploaded file",
    sub: "Fall_Semester_Grades_2023_v2.csv",
    time: "2 hours ago",
    badge: "SUCCESS",
    badgeClass: "text-emerald-600",
  },
  {
    icon: Activity,
    title: "Last process run",
    sub: "Week 8 Midterm Predictive Analysis Engine",
    time: "5 hours ago",
    badge: "COMPLETED",
    badgeClass: "text-blue-600",
  },
  {
    icon: Mail,
    title: "Notifications sent",
    sub: "432 automated risk warnings dispatched to counselors",
    time: "Yesterday",
    badge: "ARCHIVED",
    badgeClass: "text-slate-500",
  },
];

export default function DashboardPage() {
  const { data: report } = useConsolidatedReport();

  const total = report ? report.count.toLocaleString() : fallbackStats.total;
  const atRiskW4 = report
    ? report.results.filter((r) => r.subjectsAtRiskW4 > 0).length.toString()
    : fallbackStats.atRiskW4;
  const atRiskW8 = report
    ? report.results.filter((r) => r.subjectsAtRiskW8 > 0).length.toString()
    : fallbackStats.atRiskW8;
  const improved = report
    ? report.results
        .filter((r) => r.subjectsAtRiskW4 > 0 && r.subjectsAtRiskW8 < r.subjectsAtRiskW4)
        .length.toString()
    : fallbackStats.improved;

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
      sub: "12% increase observed",
      icon: TrendingUp,
      color: "from-amber-400 to-amber-500",
      accent: "bg-white/10",
    },
    {
      label: "At Risk Week 8",
      value: atRiskW8,
      sub: "Projections decreasing",
      icon: AlertTriangle,
      color: "from-rose-400 to-rose-500",
      accent: "bg-white/10",
    },
    {
      label: "Improved Students",
      value: improved,
      sub: "High intervention success",
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
                  Weekly aggregate of student risk levels
                </p>
              </div>
              <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
                <button className="rounded-full bg-white px-4 py-1 text-slate-700 shadow-sm">
                  Weekly
                </button>
                <button className="rounded-full px-4 py-1 text-slate-500">
                  Monthly
                </button>
              </div>
            </div>

            <div className="mt-8 flex h-56 items-end gap-3">
              {bars.map((b) => {
                const isPeak = b.h >= 90;
                const isHigh = b.h >= 70 && !isPeak;
                return (
                  <div
                    key={b.week}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full rounded-t-md transition ${
                        isPeak
                          ? "bg-brand-600"
                          : isHigh
                          ? "bg-brand-400"
                          : "bg-brand-200"
                      }`}
                      style={{ height: `${b.h}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-3">
              {bars.map((b) => (
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
              Concentration by department
            </p>

            <div className="mt-6 space-y-5">
              {subjects.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-slate-500">{s.value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${s.color}`}
                      style={{ width: `${s.value * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-auto rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-600 hover:bg-brand-50">
              Detailed Department Analysis
            </button>
          </Card>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold text-slate-900">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.map(
              ({ icon: Icon, title, sub, time, badge, badgeClass }) => (
                <Card
                  key={title}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon size={18} />
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
                    <div
                      className={`text-[10px] font-bold tracking-wider ${badgeClass}`}
                    >
                      {badge}
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
