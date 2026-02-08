"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminReportCard } from "@/components/admin-report-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Home,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import type { Report } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  function handleRefresh() {
    setRefreshing(true);
    fetchReports();
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "active") return report.status !== "resolved";
    if (filter === "resolved") return report.status === "resolved";
    return true;
  });

  // Group reports by location
  const reportsByLocation = filteredReports.reduce(
    (acc, report) => {
      const location = report.location || "Unknown Location";
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(report);
      return acc;
    },
    {} as Record<string, Report[]>,
  );

  const locationGroups = Object.entries(reportsByLocation).sort(
    ([, reportsA], [, reportsB]) => reportsB.length - reportsA.length,
  );

  const activeCount = reports.filter((r) => r.status !== "resolved").length;
  const reportedCount = reports.filter((r) => r.status === "reported").length;
  const acknowledgedCount = reports.filter(
    (r) => r.status === "acknowledged",
  ).length;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Manage cow reports</p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Home className="size-4" />
              Public View
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <AlertTriangle className="mx-auto size-5 text-red-500 mb-1" />
              <div className="text-2xl font-bold">{reportedCount}</div>
              <div className="text-xs text-muted-foreground">Reported</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Clock className="mx-auto size-5 text-amber-500 mb-1" />
              <div className="text-2xl font-bold">{acknowledgedCount}</div>
              <div className="text-xs text-muted-foreground">Acknowledged</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <CheckCircle2 className="mx-auto size-5 text-green-500 mb-1" />
              <div className="text-2xl font-bold">
                {reports.length - activeCount}
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
          </div>

          {/* Filter tabs + Refresh */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
                className="cursor-pointer"
              >
                Active
                {activeCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={filter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("resolved")}
                className="cursor-pointer"
              >
                Resolved
              </Button>
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="cursor-pointer"
              >
                All
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="cursor-pointer"
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Reports list grouped by location */}
          <section className="flex flex-col gap-6">
            {loading ? (
              <div className="rounded-xl border p-8 text-center">
                <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Loading reports…
                </p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-xl border p-8 text-center">
                <p className="text-muted-foreground">No reports to display</p>
              </div>
            ) : (
              locationGroups.map(([location, locationReports]) => (
                <div key={location} className="flex flex-col gap-3">
                  {/* Location header */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="size-4" />
                      {location}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {locationReports.length}
                    </Badge>
                  </div>

                  {/* Reports for this location */}
                  {locationReports.map((report) => (
                    <AdminReportCard
                      key={report.id}
                      report={report}
                      onStatusChange={fetchReports}
                    />
                  ))}
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
