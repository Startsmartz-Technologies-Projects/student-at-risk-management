"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "./api";
import type {
  ConsolidatedResponse,
  Notification,
  Paginated,
  RiskAssessment,
  Student,
} from "./types";

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(path: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(path !== null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to fetch");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

export function useStudents() {
  return useFetch<Paginated<Student>>("/students/");
}

export function useRiskAssessments(params?: {
  week?: 4 | 8;
  isAtRisk?: boolean;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.week !== undefined) qs.set("week", String(params.week));
  if (params?.isAtRisk !== undefined) qs.set("is_at_risk", String(params.isAtRisk));
  if (params?.page !== undefined) qs.set("page", String(params.page));
  const path = `/risk/assessments/${qs.toString() ? "?" + qs.toString() : ""}`;
  return useFetch<Paginated<RiskAssessment>>(path);
}

export function useNotifications() {
  return useFetch<Paginated<Notification>>("/notifications/");
}

export function useConsolidatedReport() {
  return useFetch<ConsolidatedResponse>("/reports/consolidated/");
}

export function useStudentReport(studentId: string | null) {
  return useFetch<import("./types").ConsolidatedRow>(
    studentId ? `/reports/consolidated/${studentId}/` : null
  );
}

export function useEvaluateRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (week: 4 | 8) => {
    setLoading(true);
    setError(null);
    try {
      return await api<{ evaluated: number }>("/risk/evaluate/", {
        method: "POST",
        body: { week },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);
  return { run, loading, error };
}

export function useUploadStudents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      return await api<{ created: number; updated: number }>(
        "/students/bulk-upload/",
        { method: "POST", body: fd }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);
  return { run, loading, error };
}
