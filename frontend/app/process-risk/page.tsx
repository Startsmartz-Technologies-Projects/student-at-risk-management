"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useEvaluateRisk, useSubjects } from "@/lib/hooks";
import {
  ChevronDown,
  Settings2,
  Sparkles,
  Info,
  Database,
  Clock,
} from "lucide-react";

export default function ProcessRiskPage() {
  const { data: subjects } = useSubjects();
  const [week, setWeek] = useState<4 | 8>(4);
  const [year, setYear] = useState<number | null>(null);
  const [trimester, setTrimester] = useState<number | null>(null);
  const { run, loading } = useEvaluateRisk();
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("Choose year/trimester/week and run evaluation.");

  const yearOptions = Array.from(new Set((subjects?.results ?? []).map((s) => s.year))).sort(
    (a, b) => b - a
  );
  const trimesterOptions = Array.from(
    new Set(
      (subjects?.results ?? [])
        .filter((s) => (year === null ? true : s.year === year))
        .map((s) => s.trimester)
    )
  ).sort((a, b) => a - b);

  useEffect(() => {
    if (year === null && yearOptions.length > 0) setYear(yearOptions[0]);
  }, [year, yearOptions]);

  useEffect(() => {
    if (trimester === null && trimesterOptions.length > 0) setTrimester(trimesterOptions[0]);
  }, [trimester, trimesterOptions]);

  async function onProcess() {
    try {
      setErrorText(null);
      const result = await run({
        week,
        year: year ?? undefined,
        trimester: trimester ?? undefined,
      });
      setLastRun(
        new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setStatusMsg(`Processed ${result.evaluated} enrollment(s) for Week ${week}.`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Processing failed.";
      setStatusMsg("Processing failed. Please check API/auth and try again.");
      setErrorText(msg);
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
                <div className="relative mt-2">
                  <select
                    value={year ?? ""}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
                  >
                    {yearOptions.length === 0 && <option value="">No data</option>}
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Semester
                </label>
                <div className="relative mt-2">
                  <select
                    value={trimester ?? ""}
                    onChange={(e) => setTrimester(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
                  >
                    {trimesterOptions.length === 0 && <option value="">No data</option>}
                    {trimesterOptions.map((t) => (
                      <option key={t} value={t}>
                        Trimester {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setWeek(4)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  week === 4 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                Week 4
              </button>
              <button
                onClick={() => setWeek(8)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  week === 8 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                Week 8
              </button>
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
                Last processed: {lastRun ?? "Not yet processed in this session"}
              </div>
              <div className="flex items-center gap-1.5">
                <Database size={12} />
                {statusMsg}
              </div>
            </div>
            {errorText && (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {errorText}
              </div>
            )}
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
