"use client";

import { useEffect, useState, useCallback } from "react";
import { ReportCowDialog } from "@/components/report-cow-dialog";
import {
  ActiveReportCard,
  NoActiveReports,
} from "@/components/active-report-card";
import { RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/lib/types";

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const fetchActiveReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports/active");
      const data = await res.json();
      const activeReports = data.reports || [];
      setReports(activeReports);

      // Set default selected location to the first one with reports
      if (activeReports.length > 0 && !selectedLocation) {
        setSelectedLocation(activeReports[0].location || "Unknown Location");
      }
    } catch {
      console.error("Failed to fetch active reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetchActiveReports();
  }, [fetchActiveReports]);

  function handleRefresh() {
    setRefreshing(true);
    fetchActiveReports();
  }

  // Group reports by location
  const reportsByLocation = reports.reduce(
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

  const locations = Object.keys(reportsByLocation).sort();
  const hasMultipleLocations = locations.length > 1;

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
            ) : reports.length === 0 ? (
              <NoActiveReports />
            ) : (
              <>
                {/* Location selector dropdown (only show if multiple locations) */}
                {hasMultipleLocations && (
                  <div className="mb-4">
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4" />
                              <span>{location}</span>
                              <Badge variant="secondary" className="ml-auto">
                                {reportsByLocation[location].length}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Show the most recent report for selected location */}
                {selectedLocation && reportsByLocation[selectedLocation] && (
                  <ActiveReportCard
                    report={reportsByLocation[selectedLocation][0]}
                  />
                )}
              </>
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
        </div>
      </main>
    </div>
  );
}
