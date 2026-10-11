import type { EnvLike } from "../lib/env.ts";
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

/** Upper bounds, enforced identically on the client and the server. */
export const NAME_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MAX_LENGTH = 2000;

/** Hidden field that must stay empty; filled only by naive bots. */
export const HONEYPOT_FIELD = "company";

/**
 * Structural email check.
 *
 * Deliberately permissive: it rejects whitespace and obviously malformed
 * addresses without pretending to validate the whole RFC. The pattern also
 * excludes whitespace, so it cannot be used for header injection.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isInquiryCategory = (value: unknown): value is InquiryCategory =>
  inquiryCategories.some((option) => option.value === value);

export type InquiryField = "name" | "email" | "category" | "message";

export type InquiryErrorCode = "required" | "email" | "category" | "too_long";

export interface InquiryInput {
  name?: unknown;
  email?: unknown;
  category?: unknown;
  message?: unknown;
  /** Honeypot value; any non-empty value marks the submission as automated. */
  company?: unknown;
}

export interface ValidatedInquiry {
  name: string;
  email: string;
  category: InquiryCategory;
  message: string;
}

export interface InquiryValidation {
  ok: boolean;
  errors: Partial<Record<InquiryField, InquiryErrorCode>>;
  /** Trimmed, bounded values; present only when `ok` is true. */
  value?: ValidatedInquiry;
  /** True when the honeypot was filled. */
  honeypot: boolean;
}

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * Validates and normalises an inquiry.
 *
 * Shared by the client form and the server route so the two can never drift:
 * the client uses the error codes to show localised messages, while the server
 * treats them as authoritative.
 */
export const validateInquiry = (input: InquiryInput): InquiryValidation => {
  const name = asString(input.name);
  const email = asString(input.email);
  const category = input.category;
  const message = asString(input.message);

  const errors: Partial<Record<InquiryField, InquiryErrorCode>> = {};

  if (name.length === 0) errors.name = "required";
  else if (name.length > NAME_MAX_LENGTH) errors.name = "too_long";

  if (email.length === 0) errors.email = "required";
  else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "email";
  }

  if (!isInquiryCategory(category)) errors.category = "category";

  if (message.length === 0) errors.message = "required";
  else if (message.length > MESSAGE_MAX_LENGTH) errors.message = "too_long";

  const honeypot = asString(input.company).length > 0;
  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    honeypot,
    value: ok
      ? { name, email, category: category as InquiryCategory, message }
      : undefined,
  };
};

/**
 * Server-side inbox configuration.
 *
 * Read from `process.env` only on the server. Nothing here is ever exposed to
 * the browser: the section below reduces it to a single boolean before it
 * crosses the client boundary.
 */
export interface ContactCredentials {
  apiKey: string;
  to: string;
  from: string;
}

const readEnv = (env: EnvLike, name: string): string | undefined => {
  const value = env[name];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

/** The three required variables, or `null` when any is missing. */
export const resolveContactCredentials = (
  env: EnvLike = process.env,
): ContactCredentials | null => {
  const apiKey = readEnv(env, "RESEND_API_KEY");
  const to = readEnv(env, "CONTACT_TO_EMAIL");
  const from = readEnv(env, "CONTACT_FROM_EMAIL");

  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from };
};

export interface ContactConfig {
  /** True only when email delivery is fully configured. */
  isDeliveryConfigured: boolean;
  /** Public-facing explanation shown when delivery is not configured. */
  unavailableReason: { en: string; ar: string };
  /** Server endpoint the form posts to. */
  endpoint: string;
}

/** Resolved on the server; the client receives only the boolean and strings. */
export const resolveContactConfig = (
  env: EnvLike = process.env,
): ContactConfig => ({
  isDeliveryConfigured: resolveContactCredentials(env) !== null,
  unavailableReason: {
    en: "This form cannot send yet. No email service is configured for this site, so nothing you type here is delivered or stored.",
    ar: "لا يمكن إرسال هذا النموذج بعد. لم يتم إعداد خدمة بريد إلكتروني لهذا الموقع، لذا لا يتم إرسال أو تخزين ما تكتبه هنا.",
  },
  endpoint: "/api/contact",
});
