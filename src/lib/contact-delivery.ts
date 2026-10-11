import type { InquiryCategory } from "../content/contact.ts";

/**
 * Delivery of a validated inquiry through Resend.
 *
 * The provider is called with `fetch` rather than an SDK so the project carries
 * no extra dependency and the network call is trivially mockable in tests. The
 * sender and recipient come only from server configuration; the visitor's email
 * address is used solely as `Reply-To`, never as the sender.
 *
 * A successful call means the provider accepted the message. It does not, and
 * cannot, confirm that the message reached an inbox — the public UI never claims
 * more than that.
 */

export interface DeliveryCredentials {
  apiKey: string;
  to: string;
  from: string;
}

export interface DeliveryValue {
  name: string;
  email: string;
  category: InquiryCategory;
  message: string;
}

export interface DeliveryResult {
  ok: boolean;
  /** HTTP status from the provider, when a response was received. */
  status?: number;
}

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  scouting: "Scouting / national team",
  club: "Club or contract enquiry",
  media: "Media and press",
  fan: "Fan message",
  other: "Something else",
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Builds the outgoing message.
 *
 * Only the fixed category label is allowed into the subject line, so nothing a
 * visitor types can reach an email header. Their name and message appear in the
 * plain-text body instead.
 */
export const buildInquiryEmail = (
  value: DeliveryValue,
): { subject: string; text: string } => ({
  subject: `New portfolio inquiry — ${CATEGORY_LABEL[value.category]}`,
  text: [
    "A new inquiry was submitted through the portfolio contact form.",
    "",
    `Name: ${value.name}`,
    `Email: ${value.email}`,
    `Category: ${CATEGORY_LABEL[value.category]}`,
    "",
    "Message:",
    value.message,
  ].join("\n"),
});

export const deliverInquiry = async (
  credentials: DeliveryCredentials,
  value: DeliveryValue,
  deps: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<DeliveryResult> => {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const { subject, text } = buildInquiryEmail(value);

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: credentials.from,
        to: [credentials.to],
        reply_to: value.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(deps.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    return { ok: response.ok, status: response.status };
  } catch {
    // Network failure or timeout: never surface the underlying error.
    return { ok: false };
  }
};
