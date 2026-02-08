"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import type { Report } from "@/lib/types";

const statusConfig = {
  reported: {
    label: "Reported",
    variant: "destructive" as const,
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  acknowledged: {
    label: "Acknowledged",
    variant: "default" as const,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
};

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

export function AdminReportCard({
  report,
  onStatusChange,
}: {
  report: Report;
  onStatusChange: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const config = statusConfig[report.status];
  const Icon = config.icon;

  async function handleStatusChange(newStatus: "acknowledged" | "resolved") {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      onStatusChange();
    } catch (err) {
      console.error("Failed to update report:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={`rounded-xl border p-4 ${config.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`size-5 ${config.color}`} />
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {getTimeSince(report.created_at)}
        </span>
      </div>

      {report.location && (
        <p className="text-sm font-medium mb-1">📍 {report.location}</p>
      )}

      {report.description && (
        <p className="text-sm text-muted-foreground mb-3">
          {report.description}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        {report.status === "reported" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("acknowledged")}
            disabled={updating}
            className="cursor-pointer"
          >
            {updating ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Clock className="size-3" />
                Acknowledge
              </>
            )}
          </Button>
        )}

        {(report.status === "reported" || report.status === "acknowledged") && (
          <Button
            size="sm"
            onClick={() => handleStatusChange("resolved")}
            disabled={updating}
            className="cursor-pointer"
          >
            {updating ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3" />
                Mark Resolved
              </>
            )}
          </Button>
        )}

        {report.status === "resolved" && report.resolved_at && (
          <span className="text-xs text-muted-foreground">
            Resolved {getTimeSince(report.resolved_at)}
          </span>
        )}
      </div>
    </div>
  );
}
