import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless submission tokens for the contact form.
 *
 * In-memory rate limiting is not enough on its own: each serverless instance has
 * its own memory, so a burst can simply land on a different instance. A signed,
 * time-boxed token is verified from the token itself and needs no shared store,
 * so it protects the endpoint consistently across instances.
 *
 * The token is an HMAC over the issue time, keyed with the Resend API key that
 * already has to be present for delivery to work. It is not a secret to the
 * visitor (the value is inert without the server key), and it proves only that
 * this server rendered the form and that not too long has passed since.
 */

/** A submission is rejected if it arrives faster than a human plausibly could. */
export const TOKEN_MIN_AGE_MS = 2_500;

/** Tokens expire after two hours so a stale page cannot be replayed forever. */
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1_000;

const ISSUED_AT_PATTERN = /^\d{10,17}$/;
const MAC_PATTERN = /^[a-f0-9]{64}$/;

const resolveSecret = (secret?: string): string =>
  (secret ?? process.env.RESEND_API_KEY ?? "").trim();

/** Returns `""` when delivery is not configured, so callers can pass it through. */
export const createContactToken = (options?: {
  now?: number;
  secret?: string;
}): string => {
  const secret = resolveSecret(options?.secret);
  if (!secret) return "";

  const issuedAt = String(options?.now ?? Date.now());
  const mac = createHmac("sha256", secret).update(issuedAt).digest("hex");
  return `${issuedAt}.${mac}`;
};

export const verifyContactToken = (
  token: unknown,
  options?: { now?: number; secret?: string },
): boolean => {
  if (typeof token !== "string" || token.length === 0) return false;

  const secret = resolveSecret(options?.secret);
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [issuedAtRaw, mac] = parts;
  if (!ISSUED_AT_PATTERN.test(issuedAtRaw) || !MAC_PATTERN.test(mac)) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(issuedAtRaw).digest();
  const actual = Buffer.from(mac, "hex");
  if (actual.length !== expected.length) return false;
  if (!timingSafeEqual(actual, expected)) return false;

  const issuedAt = Number(issuedAtRaw);
  const age = (options?.now ?? Date.now()) - issuedAt;
  return age >= TOKEN_MIN_AGE_MS && age <= TOKEN_MAX_AGE_MS;
};
