import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, location } = body;

    const supabase = await createAdminClient();

    // Check if there's already an active report at this location
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("location", location)
      .in("status", ["reported", "acknowledged"])
      .maybeSingle();

    if (existingReport) {
      return NextResponse.json(
        {
          error:
            "This location already has an active report. Rangers have been notified.",
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        description: description || null,
        location: location || null,
        status: "reported",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 },
      );
    }

    // TODO: Send SMS notification to ranger via Twilio

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (err) {
    console.error("Report API error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Fetch the most recent active (non-resolved) report from the last 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .in("status", ["reported", "acknowledged"])
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }

    return NextResponse.json({ report: data });
  } catch (err) {
    console.error("Report API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
