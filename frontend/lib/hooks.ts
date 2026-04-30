"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "./api";
import type {
  ConsolidatedResponse,
  Notification,
  Paginated,
  RiskSummary,
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

export function useAllRiskAssessments(params?: {
  week?: 4 | 8;
  isAtRisk?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.week !== undefined) qs.set("week", String(params.week));
  if (params?.isAtRisk !== undefined) qs.set("is_at_risk", String(params.isAtRisk));
  const path = `/risk/assessments/${qs.toString() ? "?" + qs.toString() : ""}`;

  const [data, setData] = useState<RiskAssessment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(path !== null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        let next: string | null = path;
        const all: RiskAssessment[] = [];
        while (next) {
          const pageResp: Paginated<RiskAssessment> = await api<Paginated<RiskAssessment>>(next);
          all.push(...pageResp.results);
          next = pageResp.next;
        }
        if (!cancelled) setData(all);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

export function useRiskSummary(params?: { week?: 4 | 8 }) {
  const qs = new URLSearchParams();
  if (params?.week !== undefined) qs.set("week", String(params.week));
  const path = `/risk/assessments/summary/${qs.toString() ? "?" + qs.toString() : ""}`;
  return useFetch<RiskSummary>(path);
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
  const run = useCallback(async (payload: { week: 4 | 8; year?: number; trimester?: number }) => {
    setLoading(true);
    setError(null);
    try {
      return await api<{ evaluated: number }>("/risk/evaluate/", {
        method: "POST",
        body: payload,
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
      return await api<{
        created: number;
        updated: number;
        subjectsCreated?: number;
        subjectsUpdated?: number;
        enrollmentsCreated?: number;
        metricsCreated?: number;
        metricsUpdated?: number;
      }>(
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

export function useSubjects() {
  return useFetch<Paginated<import("./types").Subject>>("/subjects/");
}

export function useUpdateRiskStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async (
      id: number,
      payload: { currentStatus: string; stillAtRiskWeek9?: boolean | null }
    ) => {
      setLoading(true);
      setError(null);
      try {
        return await api<{ id: number; currentStatus: string; stillAtRiskWeek9: boolean | null }>(
          `/risk/assessments/${id}/status/`,
          {
            method: "PATCH",
            body: payload,
          }
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return { run, loading, error };
}
