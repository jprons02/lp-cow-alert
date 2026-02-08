"use client";

import { useEffect, useState, useCallback } from "react";
import { ReportCowDialog } from "@/components/report-cow-dialog";
import {
  ActiveReportCard,
  NoActiveReports,
} from "@/components/active-report-card";
import { RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Report } from "@/lib/types";
import { DemoAlert } from "@/components/alerts";

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is logged in as admin
  useEffect(() => {
    async function checkAdminSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    }
    checkAdminSession();
  }, []);

  const fetchActiveReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports/active");
      const data = await res.json();
      const activeReports = data.reports || [];
      setReports(activeReports);
    } catch {
      console.error("Failed to fetch active reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveReports();
  }, [fetchActiveReports]);

  function handleRefresh() {
    setRefreshing(true);
    fetchActiveReports();
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">🐄 Cow Alert</h1>
            <p className="text-sm text-muted-foreground">Laureate Park</p>
          </div>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield />
                Admin
              </Button>
            </Link>
          )}
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
            ) : reports.length === 0 ? (
              <NoActiveReports />
            ) : (
              <div className="flex flex-col gap-4">
                {reports.map((report) => (
                  <ActiveReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </section>

          {/* Report button */}
          <section>
            <ReportCowDialog onReportSubmitted={fetchActiveReports} />
          </section>

          {/* Info footer */}
          <p className="text-center text-xs text-muted-foreground">
            Spotted a cow outside the fence? Tap the button above to alert the
            ranger. No account needed.
          </p>

          {/* Disclaimer */}
          <DemoAlert />
        </div>
      </main>
    </div>
  );
}
