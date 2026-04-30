"use client";

import { useMemo } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useNotifications } from "@/lib/hooks";
import { Calendar } from "lucide-react";

const scheduled = [
  {
    title: "Low Attendance Alert",
    when: "Dec 2025",
    color: "border-l-rose-400",
  },
  {
    title: "Missed Assignment Alert",
    when: "Jan 2026",
    color: "border-l-amber-400",
  },
  {
    title: "Follow-up Notification",
    when: "Feb 2026",
    color: "border-l-blue-400",
  },
];

function statusClassFor(status: string) {
  if (status === "sent") return "bg-emerald-50 text-emerald-600";
  if (status === "failed") return "bg-rose-50 text-rose-600";
  return "bg-slate-100 text-slate-500";
}

export default function NotificationsPage() {
  const { data, loading, error } = useNotifications();

  const broadcasts = useMemo(() => {
    if (!data?.results?.length) return [];
    return data.results.slice(0, 8).map((n) => ({
      subject: (n.message.split("\n").find((l) => l.trim().length > 0) || "Notification").slice(
        0,
        40
      ),
      group: n.studentName,
      date: new Date(n.created_at).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      }),
      status: n.status.toUpperCase(),
      statusClass: statusClassFor(n.status),
    }));
  }, [data]);

  return (
    <AppShell searchPlaceholder="Search notifications...">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage automated alerts and systemic communications.
          </p>
          {loading && <p className="mt-2 text-xs font-medium text-blue-600">Loading notifications...</p>}
          {error && <p className="mt-2 text-xs font-medium text-rose-600">Failed to load notifications.</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Recent Broadcasts
              </h3>
              <div className="flex rounded-full bg-slate-100 p-1 text-[11px] font-semibold">
                <button className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
                  Quarterly
                </button>
                <button className="rounded-full px-3 py-1 text-slate-500">
                  Year
                </button>
              </div>
            </div>

            <table className="mt-5 w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-left">Recipient Group</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadcasts.map((b, i) => (
                  <tr key={b.subject + i}>
                    <td className="py-4 text-sm font-medium text-brand-600">
                      {b.subject}
                    </td>
                    <td className="py-4 text-sm text-slate-500">{b.group}</td>
                    <td className="py-4 text-sm text-slate-500">{b.date}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${b.statusClass}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !error && broadcasts.length === 0 && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No notification records found.
              </div>
            )}

            <div className="mt-4 text-xs text-slate-400">
              Showing {broadcasts.length} notifications
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Scheduled Alerts
              </h3>
              <Calendar size={15} className="text-slate-400" />
            </div>

            <div className="mt-5 space-y-3">
              {scheduled.map((s) => (
                <div
                  key={s.title}
                  className={`rounded-lg border-l-4 ${s.color} bg-slate-50 px-3 py-3`}
                >
                  <div className="text-sm font-semibold text-slate-800">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500">{s.when}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
