import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["reported", "acknowledged", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const updateData: Record<string, any> = { status };

    // Set resolved_at timestamp when marking as resolved
    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("reports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update report" },
        { status: 500 },
      );
    }

    return NextResponse.json({ report: data });
  } catch (err) {
    console.error("Report update API error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
