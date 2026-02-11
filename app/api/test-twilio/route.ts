import { notifyRangersOfNewReport } from "@/lib/twilio";
import { NextResponse } from "next/server";

/**
 * Test endpoint to verify Twilio SMS integration
 * GET /api/test-twilio
 *
 * Remove this file before deploying to production
 */
export async function GET() {
  try {
    // Send a test notification
    await notifyRangersOfNewReport(
      "laureate-moss-park",
      "Test alert - if you receive this, Twilio is working!",
    );

    return NextResponse.json({
      success: true,
      message: "Test SMS sent! Check the ranger phone number.",
    });
  } catch (error) {
    console.error("Twilio test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
