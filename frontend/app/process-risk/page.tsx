"use client";

import { useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useEvaluateRisk } from "@/lib/hooks";
import {
  ChevronDown,
  Settings2,
  Sparkles,
  Info,
  Database,
  Clock,
} from "lucide-react";

export default function ProcessRiskPage() {
  const [week, setWeek] = useState<4 | 8>(4);
  const { run, loading } = useEvaluateRisk();

  async function onProcess() {
    try {
      await run(week);
    } catch {
      /* UI has no error placeholder */
    }
  }

  return (
    <AppShell searchPlaceholder="Search students...">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Process &amp; Identify Risk
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Initiate the predictive analysis engine to evaluate student
            performance data and identify potential at-risk behaviors for the
            selected academic period.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-7 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Academic Year
                </label>
                <button className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                  2025 <ChevronDown size={15} className="text-slate-400" />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Semester
                </label>
                <button
                  onClick={() => setWeek(week === 4 ? 8 : 4)}
                  className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
                >
                  {week === 4 ? "Trimester 3" : "Trimester 3 (W8)"}
                  <ChevronDown size={15} className="text-slate-400" />
                </button>
              </div>
            </div>

            <button
              onClick={onProcess}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 disabled:opacity-60"
            >
              <Settings2 size={16} />
              Process Data
            </button>

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                Last processed: Nov 2025
              </div>
              <div className="flex items-center gap-1.5">
                <Database size={12} />
                4,281 records pending
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Sparkles size={16} />
              </div>
              <h3 className="mt-3 text-base font-semibold">System Readiness</h3>
              <p className="mt-1 text-xs text-white/80">
                Neural model v4.2 is synchronized with the latest behavioral
                datasets.
              </p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/20">
                <div className="h-full w-[94%] rounded-full bg-amber-300" />
              </div>
              <div className="mt-2 text-[10px] font-semibold tracking-wider text-white/85">
                94% CONFIDENCE RATING
              </div>
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Info size={15} className="text-brand-600" />
                Processing Tip
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Ensure all LMS exports are uploaded before initiating the risk
                identification sequence.
              </p>
            </Card>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          <span className="h-1.5 w-6 rounded-full bg-brand-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        </div>
      </div>
    </AppShell>
  );
}
