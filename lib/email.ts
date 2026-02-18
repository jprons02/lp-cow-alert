import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReportEmailData {
  reportId: string;
  location: string;
  description: string | null;
}

/**
 * Send an email notification to the ranger(s) when a new cow report is submitted.
 */
export async function sendReportNotification(
  report: ReportEmailData,
): Promise<void> {
  const recipients = process.env.RANGER_EMAILS?.split(",").map((e) => e.trim());

  if (!recipients || recipients.length === 0) {
    console.warn("RANGER_EMAILS not set — skipping email notification");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
    : "https://wholetthecowsout.com/admin";

  try {
    await resend.emails.send({
      from: "Cow Alert <alerts@mail.wholetthecowsout.com>",
      to: recipients,
      subject: `🐄 Loose Cow Reported — ${report.location}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #dc2626; margin: 0 0 16px;">🐄 Loose Cow Alert</h2>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; font-weight: 600;">Location</p>
            <p style="margin: 0 0 16px; color: #374151;">${report.location}</p>
            ${
              report.description
                ? `
              <p style="margin: 0 0 8px; font-weight: 600;">Details</p>
              <p style="margin: 0; color: #374151;">${report.description}</p>
            `
                : ""
            }
          </div>
          <a href="${adminUrl}" style="display: inline-block; background: #16a34a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">
            View in Admin Dashboard →
          </a>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
            Report ID: ${report.reportId}
          </p>
        </div>
      `,
    });

    console.log(`[email] Report notification sent to ${recipients.join(", ")}`);
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
    // Don't throw — email failure shouldn't block report submission
  }
}
