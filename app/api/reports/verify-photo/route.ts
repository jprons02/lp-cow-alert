import { detectCow } from "@/lib/cow-detection";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photo } = body;

    if (!photo) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    console.log(
      "[verify-photo] Received photo, length:",
      photo.length,
      "chars",
    );

    const result = await detectCow(photo);
    console.log("[verify-photo] Detection result:", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Photo verification error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to verify photo",
      },
      { status: 500 },
    );
  }
}
