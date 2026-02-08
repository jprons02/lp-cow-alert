"use client";

import { useEffect, useState, useCallback } from "react";
import { ReportCowDialog } from "@/components/report-cow-dialog";
import {
  ActiveReportCard,
  NoActiveReports,
} from "@/components/active-report-card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/types";

export default function Home() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestReport = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReport(data.report || null);
    } catch {
      console.error("Failed to fetch latest report");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestReport();
  }, [fetchLatestReport]);

  function handleRefresh() {
    setRefreshing(true);
    fetchLatestReport();
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-bold tracking-tight">🐄 Cow Alert</h1>
          <p className="text-sm text-muted-foreground">Laureate Park</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          {/* Status section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Current Status
              </h2>
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

            {loading ? (
              <div className="rounded-xl border p-6 text-center">
                <div className="mx-auto size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Checking for reports…
                </p>
              </div>
            ) : report ? (
              <ActiveReportCard report={report} />
            ) : (
              <NoActiveReports />
            )}
          </section>

          {/* Report button */}
          <section>
            <ReportCowDialog onReportSubmitted={fetchLatestReport} />
          </section>

          {/* Info footer */}
          <p className="text-center text-xs text-muted-foreground">
            Spotted a cow outside the fence? Tap the button above to alert the
            ranger. No account needed.
          </p>
        </div>
      </main>
    </div>
  );
}
