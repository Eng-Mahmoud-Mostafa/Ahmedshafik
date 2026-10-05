import type { LocalizedText } from "./types.ts";

export type InquiryCategory = "scouting" | "club" | "media" | "fan" | "other";

export interface InquiryOption {
  value: InquiryCategory;
  label: LocalizedText;
}

export const inquiryCategories: InquiryOption[] = [
  { value: "scouting", label: { en: "Scouting / national team", ar: "الكشافة / منتخب" } },
  { value: "club", label: { en: "Club or contract enquiry", ar: "استفسار نادٍ أو عقد" } },
  { value: "media", label: { en: "Media and press", ar: "الإعلام والصحافة" } },
  { value: "fan", label: { en: "Fan message", ar: "رسالة من مشجع" } },
  { value: "other", label: { en: "Something else", ar: "شيء آخر" } },
];

/** Maximum message length enforced by the client-side validation. */
export const MESSAGE_MAX_LENGTH = 2000;

/**
 * Server-side configuration for inquiry delivery.
 *
 * Values are read from server-only environment variables so that no future
 * service credential is ever exposed to the browser. When the variables are
 * absent the contact form stays visibly unavailable.
 */
export interface ContactConfig {
  /** True only when a delivery service is fully configured. */
  isDeliveryConfigured: boolean;
  /** Public-facing explanation shown when delivery is not configured. */
  unavailableReason: LocalizedText;
  /**
   * Routes inquiries to the server endpoint added in a later stage.
   * Present now so the client and server contract is explicit.
   */
  endpoint: string;
}

const readEnv = (name: string): string | undefined => {
  // `process.env` is replaced at build time by Next.js for server code.
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

/** Resolved on the server; passed to the client form as a plain prop. */
export const resolveContactConfig = (): ContactConfig => {
  const provider = readEnv("CONTACT_PROVIDER");
  const apiKey = readEnv("CONTACT_API_KEY");
  const recipient = readEnv("CONTACT_TO_EMAIL");

  const isDeliveryConfigured = Boolean(provider && apiKey && recipient);

  return {
    isDeliveryConfigured,
    unavailableReason: {
      en: "This form cannot send yet. No email service is configured for this site, so nothing you type here is delivered or stored.",
      ar: "لا يمكن إرسال هذه النموذج بعد. لم يتم إعداد خدمة بريد إلكتروني لهذا الموقع، لذا لا يتم إرسال أو تخزين ما تكتبه هنا.",
    },
    endpoint: "/api/contact",
  };
};