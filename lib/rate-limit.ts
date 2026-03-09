import { createAdminClient } from "@/lib/supabase/server";

interface RateLimitResult {
  allowed: boolean;
  reason: string | null;
}

/**
 * Check if a device/IP is allowed to submit a report today.
 * - 2 reports per device fingerprint per day
 * - 4 reports per IP per day (accounts for shared networks / households)
 */
export async function checkRateLimit(
  fingerprint: string,
  ipAddress: string,
): Promise<RateLimitResult> {
  const supabase = await createAdminClient();

  // Start of today (UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Check by fingerprint — 2 per day
  const { count: fingerprintCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("fingerprint", fingerprint)
    .gte("created_at", todayStr);

  if (fingerprintCount && fingerprintCount >= 2) {
    return {
      allowed: false,
      reason:
        "You have already submitted 2 reports today. Please try again tomorrow.",
    };
  }

  // Check by IP — allow 4 per IP (shared networks)
  const { count: ipCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ipAddress)
    .gte("created_at", todayStr);

  if (ipCount && ipCount >= 4) {
    return {
      allowed: false,
      reason: "Report limit reached from this network today.",
    };
  }

  return { allowed: true, reason: null };
}
