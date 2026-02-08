export type ReportStatus = "reported" | "acknowledged" | "resolved";

export interface Report {
  id: string;
  description: string | null;
  location: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
}
