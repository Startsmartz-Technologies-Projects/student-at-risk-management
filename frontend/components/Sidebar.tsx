"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Upload,
  FileSearch,
  AlertTriangle,
  Bell,
  CheckSquare,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/upload-data", label: "Upload Data", icon: Upload },
  { href: "/process-risk", label: "Process & Identify Risk", icon: FileSearch },
  { href: "/at-risk-students", label: "At-Risk Students", icon: AlertTriangle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/final-status", label: "Final Status", icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 pt-6 pb-8">
        <h1 className="text-[15px] font-bold tracking-tight text-slate-900">
          Admin Panel
        </h1>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Risk Management
        </p>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={17}
                    className={active ? "text-brand-600" : "text-slate-400"}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
          AU
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-800">Admin User</div>
          <div className="text-[11px] text-slate-500">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}
