"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportCowDialog } from "@/components/report-cow-dialog";
import {
  ActiveReportCard,
  NoActiveReports,
} from "@/components/active-report-card";
import { DemoAlert } from "@/components/alerts";
import type { Report } from "@/lib/types";

interface MainContentProps {
  reports: Report[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onReportSubmitted: () => void;
}

export function MainContent({
  reports,
  loading,
  refreshing,
  onRefresh,
  onReportSubmitted,
}: MainContentProps) {
  return (
    <main className="flex-1 px-4 py-5">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        {/* Report button — primary CTA */}
        <section>
          <ReportCowDialog onReportSubmitted={onReportSubmitted} />
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Status
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Status section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Active Reports
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="cursor-pointer"
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {loading ? (
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Checking for reports…
              </p>
            </div>
          ) : reports.length === 0 ? (
            <NoActiveReports />
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((report) => (
                <ActiveReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <DemoAlert />
      </div>
    </main>
  );
}
