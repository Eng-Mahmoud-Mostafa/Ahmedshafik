import { NextResponse } from "next/server";
import { resolveContactCredentials, validateInquiry } from "@/content/contact";
import { deliverInquiry } from "@/lib/contact-delivery";
import { rateLimitAllow } from "@/lib/contact-rate-limit";
import { verifyContactToken } from "@/lib/contact-token";

/**
 * Inquiry endpoint.
 *
 * The browser posts JSON here. Everything that can be abused is checked on the
 * server: the payload shape, the field values, a signed submission token and a
 * best-effort rate limit. Only when the configured email provider accepts the
 * message does the route answer `{ ok: true }`; the public UI never claims more
 * than "accepted", never that it reached an inbox.
 *
 * The visitor's email address is used as `Reply-To` only. The sender and the
 * recipient are fixed by server configuration, so this endpoint can never be
 * turned into an open relay. No credential or internal error is ever returned.
 */

export const runtime = "nodejs";

/** Generous for a 2,000-character message plus JSON scaffolding. */
const MAX_BODY_BYTES = 20_000;

const NO_STORE = { "Cache-Control": "no-store" } as const;

const fail = (
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
): NextResponse =>
  NextResponse.json(
    { ok: false, code, message, ...extra },
    { status, headers: NO_STORE },
  );

/** First hop of the client address, as set by the hosting proxy. */
const clientKey = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first && first.trim().length > 0) return first.trim();
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

export async function POST(request: Request): Promise<NextResponse> {
  const credentials = resolveContactCredentials();
  if (!credentials) {
    return fail(
      503,
      "delivery_not_configured",
      "Inquiry delivery is not configured. No message was received or stored.",
    );
  }

  const limit = rateLimitAllow(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate_limited",
        message: "Too many requests. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          ...NO_STORE,
          "Retry-After": String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))),
        },
      },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return fail(413, "payload_too_large", "The submitted message is too large.");
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return fail(413, "payload_too_large", "The submitted message is too large.");
    }
    body = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_input", "The request body could not be read.");
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail(400, "invalid_input", "The request body is not valid.");
  }

  const record = body as Record<string, unknown>;

  if (!verifyContactToken(record.token)) {
    return fail(
      400,
      "invalid_request",
      "This form session is no longer valid. Reload the page and try again.",
    );
  }

  const validation = validateInquiry(record);

  if (validation.honeypot) {
    // Answer as if accepted so automated senders learn nothing, but send nothing.
    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
  }

  if (!validation.ok || !validation.value) {
    return NextResponse.json(
      { ok: false, code: "invalid_input", errors: validation.errors },
      { status: 400, headers: NO_STORE },
    );
  }

  const result = await deliverInquiry(credentials, validation.value);
  if (!result.ok) {
    return fail(
      502,
      "delivery_failed",
      "The email service did not accept the message. Please try again later.",
    );
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
}

export function GET(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      code: "method_not_allowed",
      message: "Use POST to submit an inquiry.",
    },
    { status: 405, headers: { ...NO_STORE, Allow: "POST" } },
  );
}
