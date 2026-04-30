import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import {
  Mail,
  Phone,
  MapPin,
  Download,
  Pencil,
  AlertTriangle,
  Users,
  BookOpen,
  CalendarX,
} from "lucide-react";

const activity = [
  {
    day: 24,
    icon: AlertTriangle,
    iconClass: "bg-rose-50 text-rose-500",
    title: "Missed Assessment: Advanced Mathematics",
    desc: "Third consecutive missed assignment for the semester. Submission risk flag triggered due to non-engagement with LMS modules.",
    badge: "CRITICAL",
    badgeClass: "bg-rose-100 text-rose-600",
  },
  {
    day: 22,
    icon: Users,
    iconClass: "bg-blue-50 text-blue-500",
    title: "Counselor Check-in",
    desc: "Bi-weekly meeting completed. Student expressed feeling overwhelmed. Recommended adjusted peer group participation.",
    badge: "INFO",
    badgeClass: "bg-blue-100 text-blue-600",
  },
  {
    day: 19,
    icon: BookOpen,
    iconClass: "bg-emerald-50 text-emerald-500",
    title: "Resource Access: Career Guidance",
    desc: "Accessed the career portal for 45 minutes. Viewed materials related to Postdoctoral Engineering.",
    badge: "POS",
    badgeClass: "bg-emerald-100 text-emerald-600",
  },
  {
    day: 18,
    icon: CalendarX,
    iconClass: "bg-amber-50 text-amber-500",
    title: "Attendance Warning",
    desc: "Flagged for unexcused absence during Monday's core lectures. Auto-prior notification provided by student or guardian.",
    badge: "WARN",
    badgeClass: "bg-amber-100 text-amber-600",
  },
];

const sentimentBars = [70, 55, 80, 40, 30, 22];

export default function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const name = params.id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  return (
    <AppShell
      headerLeftBadge={
        <span className="ml-auto flex items-center gap-3 text-xs font-semibold text-slate-500">
          <button className="hover:text-slate-800">System Status</button>
          <button className="hover:text-slate-800">Archive</button>
          <button className="text-brand-600">Student Profile</button>
        </span>
      }
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white">
                {name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-600">
                    HIGH RISK
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ID: 20057033
                  </span>
                </div>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                  {name}
                </h1>
                <div className="mt-1 text-xs text-slate-500">
                  Grade Level 11 · Joined Aug 2022
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Download size={13} />
                Export Report
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                <Pencil size={13} />
                Edit Record
              </button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-800">
                Contact Details
              </h3>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      School Email
                    </div>
                    <div className="text-slate-700">
                      20057033@students.uni.edu
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </div>
                    <div className="text-slate-700">+91 4570 7804</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Emergency Contact
                    </div>
                    <div className="text-slate-700">
                      Farah Iqbal (Mother)
                      <div className="text-xs text-slate-500">
                        +91 9377 9009210
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Sentiment Trend
                </h3>
                <span className="text-[11px] font-semibold text-rose-500">
                  -42%
                </span>
              </div>
              <div className="mt-5 flex h-28 items-end gap-2">
                {sentimentBars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-md ${
                      i < 3 ? "bg-blue-200" : "bg-rose-300"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
              </div>
            </Card>
          </div>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Detailed Activity Log
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Monitoring Active
              </span>
            </div>

            <div className="mt-6 space-y-1">
              {activity.map((a) => (
                <div
                  key={a.day + a.title}
                  className="flex gap-4 border-b border-slate-100 py-4 last:border-none"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {a.day}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Today
                    </div>
                  </div>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.iconClass}`}
                  >
                    <a.icon size={15} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-semibold text-slate-800">
                        {a.title}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${a.badgeClass}`}
                      >
                        {a.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {a.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              VIEW FULL HISTORY
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
