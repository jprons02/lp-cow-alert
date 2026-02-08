import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test the regular server client
    const supabase = await createClient();
    const { data: publicData, error: publicError } = await supabase
      .from("_test_connection")
      .select("*")
      .limit(1);

    // Test the admin client
    const adminClient = await createAdminClient();
    const { data: adminData, error: adminError } = await adminClient
      .from("_test_connection")
      .select("*")
      .limit(1);

    // Check if we can at least connect (even if table doesn't exist)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        serverClient: {
          connected: true,
          // If error is about missing table, that's fine - connection works
          canQuery: !publicError || publicError.code === "42P01",
          error: publicError?.message || null,
        },
        adminClient: {
          connected: true,
          canQuery: !adminError || adminError.code === "42P01",
          error: adminError?.message || null,
        },
        auth: {
          configured: true,
          currentUser: user ? "authenticated" : "anonymous",
        },
        env: {
          hasProjectUrl: !!process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          hasSecretKey: !!process.env.SUPABASE_SECRET_KEY,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
