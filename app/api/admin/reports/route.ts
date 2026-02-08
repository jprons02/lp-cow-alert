import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Fetch all reports from the last 7 days, ordered by most recent first
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }

    return NextResponse.json({ reports: data });
  } catch (err) {
    console.error("Admin reports API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
