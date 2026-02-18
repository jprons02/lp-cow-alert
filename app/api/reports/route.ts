import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { detectCow } from "@/lib/cow-detection";
import { checkRateLimit } from "@/lib/rate-limit";
import { isWithinRange, MAX_DISTANCE_MILES } from "@/lib/geolocation";
import { getLocationByName } from "@/lib/locations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      description,
      location,
      photo,
      fingerprint,
      reporterLat,
      reporterLng,
    } = body;

    // --- Validate required fields ---
    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 },
      );
    }

    if (!photo) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Device identification failed" },
        { status: 400 },
      );
    }

    // --- Rate limiting (fingerprint + IP) ---
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = await checkRateLimit(fingerprint, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    // --- GPS proximity check ---
    const matchedLocation = getLocationByName(location);
    if (matchedLocation && reporterLat != null && reporterLng != null) {
      if (
        !isWithinRange(
          reporterLat,
          reporterLng,
          matchedLocation.lat,
          matchedLocation.lng,
          MAX_DISTANCE_MILES,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "You appear to be too far from the reported location. Please report from near where you see the cow.",
          },
          { status: 400 },
        );
      }
    }

    // --- Cow detection ---
    const detection = await detectCow(photo);
    if (!detection.isCow) {
      return NextResponse.json(
        {
          error:
            "We couldn't detect a cow in your photo. Please take a clearer photo.",
        },
        { status: 400 },
      );
    }

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

    // Strip data-url prefix before storing
    const photoData = photo.replace(/^data:image\/\w+;base64,/, "");

    const { data, error } = await supabase
      .from("reports")
      .insert({
        description: description || null,
        location,
        status: "reported",
        photo_base64: photoData,
        fingerprint,
        ip_address: ip,
        reporter_lat: reporterLat ?? null,
        reporter_lng: reporterLng ?? null,
      })
      .select("id, description, location, status, created_at, resolved_at")
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
      .select("id, description, location, status, created_at, resolved_at")
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
