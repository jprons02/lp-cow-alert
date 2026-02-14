"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MainContent } from "@/components/main-content";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import type { Report } from "@/lib/types";

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
      <Navbar isAdmin={isAdmin} />
      <Hero />
      <MainContent
        reports={reports}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onReportSubmitted={fetchActiveReports}
      />
      <Footer />
    </div>
  );
}
