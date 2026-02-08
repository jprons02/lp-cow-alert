import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Fetch all active (non-resolved) reports from the last 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .in("status", ["reported", "acknowledged"])
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }

    return NextResponse.json({ reports: data || [] });
  } catch (err) {
    console.error("Active reports API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
