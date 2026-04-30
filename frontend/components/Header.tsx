"use client";

import { Search } from "lucide-react";

interface HeaderProps {
  searchPlaceholder?: string;
  title?: string;
  leftBadge?: React.ReactNode;
}

export default function Header({
  searchPlaceholder = "Search student records...",
  title = "Student Risk Management System",
  leftBadge,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex flex-1 items-center gap-6">
        <div className="relative w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {leftBadge}
      </div>

      <div className="flex items-center gap-5">
        <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
        <button className="rounded-full bg-brand-600 px-5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
          Admin
        </button>
      </div>
    </header>
  );
}
