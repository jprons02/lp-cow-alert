import twilio from "twilio";

/**
 * Server-only Twilio client
 * DO NOT import this file in client components
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  return twilio(accountSid, authToken);
}

export interface SendSMSOptions {
  to: string;
  message: string;
}

/**
 * Send an SMS message via Twilio
 * Returns the message SID on success, or null if Twilio is not configured
 */
export async function sendSMS({
  to,
  message,
}: SendSMSOptions): Promise<string | null> {
  // Allow graceful degradation if Twilio is not configured
  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio not configured - SMS not sent");
    return null;
  }

  const client = getTwilioClient();

  const result = await client.messages.create({
    body: message,
    from: fromNumber,
    to,
  });

  return result.sid;
}
