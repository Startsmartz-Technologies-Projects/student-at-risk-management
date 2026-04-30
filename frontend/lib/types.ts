export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "coordinator" | "tutor";
}

export interface Student {
  id: number;
  studentId: string;
  studentName: string;
  email: string;
  enrolledAt: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  trimester: number;
  year: number;
}

export interface Enrollment {
  id: number;
  student: number;
  subject: number;
  trimester: number;
  year: number;
  studentName: string;
  subjectCode: string;
  subjectName: string;
}

export interface WeeklyMetric {
  id: number;
  enrollment: number;
  week: 4 | 8;
  attendancePct: string;
  tutorialSubmissionPct: string;
  assessmentAttemptPct: string;
  recorded_at: string;
}

export interface ActionLog {
  id: number;
  actionTaken: string;
  actionDate: string;
  performedBy: number | null;
  notes: string;
}

export interface RiskAssessment {
  id: number;
  enrollment: number;
  week: 4 | 8;
  isAtRisk: boolean;
  reasons: string[];
  evaluatedAt: string;
  studentName: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  actions: ActionLog[];
}

export interface Notification {
  id: number;
  student: number;
  subject: number | null;
  channel: "email" | "sms";
  message: string;
  status: "queued" | "sent" | "failed";
  sentAt: string | null;
  related_assessment: number | null;
  studentName: string;
  subjectCode: string | null;
  created_at: string;
}

export interface ConsolidatedRow {
  studentId: string;
  studentName: string;
  email: string;
  subjectsAtRiskW4: number;
  subjectsAtRiskW8: number;
  totalSubjects: number;
  riskPct: number;
  overallRiskLevel: "High" | "Medium" | "Low" | "None";
}

export interface ConsolidatedResponse {
  results: ConsolidatedRow[];
  count: number;
}
