import type { Report } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, MapPin } from "lucide-react";

function getTimeSince(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const statusConfig = {
  reported: {
    label: "Reported",
    variant: "destructive" as const,
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/25",
    message: "A loose cow has been reported. The ranger has been notified.",
  },
  acknowledged: {
    label: "Acknowledged",
    variant: "default" as const,
    icon: Clock,
    color: "text-chart-5",
    bg: "bg-chart-5/10 border-chart-5/25",
    message: "The ranger is aware and responding.",
  },
  resolved: {
    label: "Resolved",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    message: "This has been resolved.",
  },
};

export function ActiveReportCard({ report }: { report: Report }) {
  const config = statusConfig[report.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-5 ${config.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`size-5 ${config.color}`} />
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {getTimeSince(report.created_at)}
        </span>
      </div>

      <p className={`mt-3 text-sm font-medium ${config.color}`}>
        {config.message}
      </p>

      {report.location && (
        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="size-4" />
          {report.location}
        </p>
      )}
    </div>
  );
}

export function NoActiveReports() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/8 p-6 text-center">
      <CheckCircle2 className="mx-auto size-10 text-primary" />
      <p className="mt-3 text-lg font-medium text-primary">All clear!</p>
      <p className="mt-1 text-sm text-muted-foreground">
        No loose cows have been reported recently.
      </p>
    </div>
  );
}
