export type ReportStatus = "reported" | "acknowledged" | "resolved";

export interface Report {
  id: string;
  description: string | null;
  location: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  photo_base64: string | null;
  fingerprint: string | null;
  ip_address: string | null;
  reporter_lat: number | null;
  reporter_lng: number | null;
}
