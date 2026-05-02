"use client";

import { useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useNotifications, useSendNotifications } from "@/lib/hooks";

function statusClassFor(status: string) {
  if (status === "sent") return "bg-emerald-50 text-emerald-600";
  if (status === "failed") return "bg-rose-50 text-rose-600";
  return "bg-slate-100 text-slate-500";
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [weekFilter, setWeekFilter] = useState<"all" | 4 | 8>("all");
  const { data, loading, error, refetch } = useNotifications({ page });
  const { run: sendNotifications, loading: sending, error: sendError } = useSendNotifications();
  const [sendMsg, setSendMsg] = useState<string>("");

  async function handleSend(week: 4 | 8) {
    setSendMsg("");
    try {
      const result = await sendNotifications(week);
      setSendMsg(`Week ${week}: ${result.queuedAndDispatched} notification(s) queued and dispatched.`);
      refetch();
    } catch {
      setSendMsg(`Week ${week}: send failed.`);
    }
  }

  const broadcasts = useMemo(() => {
    if (!data?.results?.length) return [];
    const mapped = data.results.map((n) => {
      const msg = n.message.toLowerCase();
      const week: 4 | 8 | null = msg.includes("week 8") ? 8 : msg.includes("week 4") ? 4 : null;
      return {
      subject: (n.message.split("\n").find((l) => l.trim().length > 0) || "Notification").slice(
        0,
        40
      ),
      group: n.studentName,
      date: new Date(n.created_at).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      }),
      week,
      status: n.status.toUpperCase(),
      statusClass: statusClassFor(n.status),
      };
    });
    if (weekFilter === "all") return mapped;
    return mapped.filter((m) => m.week === weekFilter);
  }, [data, weekFilter]);

  const total = data?.count ?? 0;
  const start = total === 0 ? 0 : (page - 1) * broadcasts.length + 1;
  const end = total === 0 ? 0 : start + broadcasts.length - 1;
  const canPrev = Boolean(data?.previous);
  const canNext = Boolean(data?.next);

  return (
    <AppShell searchPlaceholder="Search notifications...">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage automated alerts and systemic communications.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void handleSend(4)}
              disabled={sending}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send Week 4 Mail
            </button>
            <button
              onClick={() => void handleSend(8)}
              disabled={sending}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send Week 8 Mail
            </button>
          </div>
          {sendMsg && <p className="mt-2 text-xs font-medium text-emerald-700">{sendMsg}</p>}
          {sendError && <p className="mt-2 text-xs font-medium text-rose-600">Send error: {sendError}</p>}
          {loading && <p className="mt-2 text-xs font-medium text-blue-600">Loading notifications...</p>}
          {error && <p className="mt-2 text-xs font-medium text-rose-600">Failed to load notifications.</p>}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Recent Broadcasts
              </h3>
              <div className="flex rounded-full bg-slate-100 p-1 text-[11px] font-semibold">
                <button
                  onClick={() => setWeekFilter("all")}
                  className={`rounded-full px-3 py-1 ${weekFilter === "all" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setWeekFilter(4)}
                  className={`rounded-full px-3 py-1 ${weekFilter === 4 ? "bg-white text-slate-700 shadow-sm" : "text-slate-500"}`}
                >
                  Week 4
                </button>
                <button
                  onClick={() => setWeekFilter(8)}
                  className={`rounded-full px-3 py-1 ${weekFilter === 8 ? "bg-white text-slate-700 shadow-sm" : "text-slate-500"}`}
                >
                  Week 8
                </button>
              </div>
            </div>

            <table className="mt-5 w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-left">Recipient Group</th>
                  <th className="py-3 text-left">Week</th>
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
                    <td className="py-4 text-sm text-slate-500">
                      {b.week ? `Week ${b.week}` : "Unknown"}
                    </td>
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
              {weekFilter === "all"
                ? `Showing ${start}-${end} of ${total} notifications`
                : `Showing ${broadcasts.length} notification(s) for Week ${weekFilter}`}
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev || loading}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!canNext || loading}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
