import { NextResponse } from "next/server";

/**
 * Inquiry endpoint placeholder for stage two.
 *
 * Stage one deliberately does not accept submissions. Until an email service is
 * configured there is nowhere to deliver to, so the route answers honestly
 * instead of pretending to succeed. The client keeps the form disabled in the
 * meantime, so this path is not normally reached.
 *
 * Future shape (implemented in stage two, credentials read server-side only):
 *   1. validate the payload,
 *   2. call the configured provider (Resend / Postmark / SES),
 *   3. return 200 `{ ok: true }` only after the provider accepted the message.
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      code: "delivery_not_configured",
      message:
        "Inquiry delivery is not configured yet. No message was received or stored.",
    },
    { status: 503 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      code: "delivery_not_configured",
      message:
        "Inquiry delivery is not configured yet. No message was received or stored.",
    },
    { status: 503 },
  );
}