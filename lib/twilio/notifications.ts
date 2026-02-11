import { sendSMS } from "./client";
import { PREDEFINED_LOCATIONS } from "@/lib/locations";

/**
 * Get the ranger phone number(s) to notify
 * For cost savings, this sends to a single number by default
 * Add multiple numbers comma-separated in RANGER_PHONE_NUMBERS for group alerts
 */
function getRangerPhoneNumbers(): string[] {
  const numbers = process.env.RANGER_PHONE_NUMBERS;
  if (!numbers) {
    console.warn("RANGER_PHONE_NUMBERS not configured");
    return [];
  }
  return numbers.split(",").map((n) => n.trim());
}

/**
 * Get location display name from location ID
 */
function getLocationName(locationId: string | null): string {
  if (!locationId) return "Unknown location";
  const location = PREDEFINED_LOCATIONS.find((loc) => loc.id === locationId);
  return location?.name ?? locationId;
}

/**
 * Notify rangers of a new cow sighting report
 * Keeps message short to minimize SMS costs (under 160 chars = 1 segment)
 */
export async function notifyRangersOfNewReport(
  locationId: string | null,
  description: string | null,
): Promise<void> {
  const phoneNumbers = getRangerPhoneNumbers();

  if (phoneNumbers.length === 0) {
    console.warn("No ranger phone numbers configured - skipping notification");
    return;
  }

  const locationName = getLocationName(locationId);

  // Keep message concise to stay under 160 chars (1 SMS segment)
  let message = `🐄 COW ALERT: Sighting reported at ${locationName}.`;
  if (description) {
    // Truncate description if needed to keep under 160 total
    const maxDescLength = 160 - message.length - 10;
    if (description.length > maxDescLength && maxDescLength > 0) {
      message += ` "${description.substring(0, maxDescLength)}..."`;
    } else if (maxDescLength > 0) {
      message += ` "${description}"`;
    }
  }

  // Send to all configured ranger numbers
  const results = await Promise.allSettled(
    phoneNumbers.map((to) => sendSMS({ to, message })),
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to send SMS to ${phoneNumbers[index]}:`,
        result.reason,
      );
    }
  });
}

/**
 * Optional: Notify rangers when a report is resolved
 * Disabled by default to minimize costs
 */
export async function notifyRangersOfResolvedReport(
  locationId: string | null,
): Promise<void> {
  // Uncomment to enable resolution notifications
  // Note: This doubles SMS costs per incident
  /*
  const phoneNumbers = getRangerPhoneNumbers();
  if (phoneNumbers.length === 0) return;

  const locationName = getLocationName(locationId);
  const message = `✅ Cow situation resolved at ${locationName}.`;

  await Promise.allSettled(
    phoneNumbers.map((to) => sendSMS({ to, message }))
  );
  */
  console.log(
    "Resolution notification disabled to minimize costs. Enable in lib/twilio/notifications.ts if needed.",
  );
}
