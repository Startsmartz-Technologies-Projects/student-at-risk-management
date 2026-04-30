# Frontend Changes — Backend Wire-up

This document lists every frontend file touched while wiring the existing UI to the new Django backend. **No Tailwind classes, JSX structure, colors, or layouts were changed.** Only the data source moved from inline arrays to API hooks.

## New files

| File | Purpose |
| --- | --- |
| `lib/api.ts` | `fetch` wrapper. Base URL from `NEXT_PUBLIC_API_URL`. JWT attach + auto-refresh on 401. `login()` / `logout()` helpers. |
| `lib/types.ts` | TypeScript types matching every DRF serializer (`Student`, `RiskAssessment`, `Notification`, `ConsolidatedRow`, etc.). |
| `lib/hooks.ts` | Resource hooks built with `useState`/`useEffect` (no new lib introduced): `useStudents`, `useRiskAssessments`, `useNotifications`, `useConsolidatedReport`, `useStudentReport`, `useEvaluateRisk`, `useUploadStudents`. |
| `.env.local.example` | `NEXT_PUBLIC_API_URL=http://localhost:8000/api` |
| `.env.local` | Same as above (dev default). |

## Modified pages

All pages were converted from server components to client components (`"use client"` added at top). The existing static demo arrays were **kept as fallbacks** so the UI looks identical before any fetch resolves and degrades gracefully if the backend is offline. No JSX, classes, or layout was changed.

| File | Hook used | Data flow |
| --- | --- | --- |
| `app/page.tsx` (Dashboard) | `useConsolidatedReport` | Top stat cards (Total, At-Risk W4/W8, Improved) compute from the consolidated report when loaded. Bar chart, subjects panel, and Recent Activity remain static (no equivalent backend metric series exists yet). |
| `app/upload-data/page.tsx` | `useUploadStudents` | "Upload File" button now opens a file picker and POSTs the chosen `.xlsx` to `/api/students/bulk-upload/`. New uploads are appended to the local "Previous Uploads" table on success. |
| `app/process-risk/page.tsx` | `useEvaluateRisk` | "Process Data" button now POSTs `/api/risk/evaluate/` with the selected week. Semester button toggles between W4 / W8. |
| `app/at-risk-students/page.tsx` | `useRiskAssessments({ isAtRisk: true })` | Stat tiles, intervention table, and "Showing N of M" counts compute from live assessments. Tier label inferred from number of breached reasons (3 → Tier 3, 2 → Tier 2, else Tier 1). Department concentration bars and "Automated Intervention Status" panel remain static. |
| `app/notifications/page.tsx` | `useNotifications` | Recent Broadcasts table is populated from `/api/notifications/`. Scheduled Alerts panel remains static (no backend model for it yet). |
| `app/final-status/page.tsx` | `useConsolidatedReport` | Report Summary numbers (Total Processed, Pending Reviews) and Student Ledger rows are derived from the consolidated report. |

## Unchanged pages

| File | Reason |
| --- | --- |
| `app/at-risk-students/[id]/page.tsx` (Student Profile detail) | The page renders an activity log of entry types (counselor check-ins, resource access, attendance warnings) that the backend doesn't model. Wiring it to a hook would mean inventing endpoints that don't exist. Left as a server component with the existing static demo data. |

## Components

No component file (`AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`, `Card.tsx`) was modified. They contain no data — only layout — so wiring did not touch them.

## How to verify zero UI drift

1. With the backend off, every page renders exactly as before (fallback data).
2. With the backend running and seeded (`make seed`), only the **values** in stat cards and tables change — every class, color, border-radius, padding, font weight, and icon stays identical.
3. Diff any two screenshots (before / after backend running) — only text/numbers should differ.

## Env

Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `http://localhost:8000/api`). JWT tokens are stored in `localStorage` under `srm.access` / `srm.refresh`.
