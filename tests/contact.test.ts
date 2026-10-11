import assert from "node:assert/strict";
import { test } from "node:test";

import {
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  resolveContactConfig,
  resolveContactCredentials,
  validateInquiry,
} from "../src/content/contact.ts";
import {
  createContactToken,
  TOKEN_MAX_AGE_MS,
  TOKEN_MIN_AGE_MS,
  verifyContactToken,
} from "../src/lib/contact-token.ts";
import {
  buildInquiryEmail,
  deliverInquiry,
} from "../src/lib/contact-delivery.ts";
import {
  RATE_LIMIT_MAX,
  rateLimitAllow,
  resetRateLimit,
} from "../src/lib/contact-rate-limit.ts";
import { isProductionDeployment } from "../src/lib/deployment.ts";
import {
  buildPersonStructuredData,
  serializeStructuredData,
} from "../src/lib/structured-data.ts";

/* ------------------------------------------------------------------ validation */

test("empty submissions are rejected field by field", () => {
  const result = validateInquiry({});
  assert.equal(result.ok, false);
  assert.equal(result.value, undefined);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    "category",
    "email",
    "message",
    "name",
  ]);
});

test("a malformed email is rejected", () => {
  const result = validateInquiry({
    name: "A visitor",
    email: "not-an-email",
    category: "fan",
    message: "Hello there",
  });
  assert.equal(result.errors.email, "email");
});

test("an unknown inquiry category is rejected", () => {
  const result = validateInquiry({
    name: "A visitor",
    email: "a@b.co",
    category: "spam",
    message: "Hello there",
  });
  assert.equal(result.errors.category, "category");
});

test("over-long fields are rejected rather than silently truncated", () => {
  const result = validateInquiry({
    name: "a".repeat(NAME_MAX_LENGTH + 1),
    email: `a@${"b".repeat(EMAIL_MAX_LENGTH)}.com`,
    category: "other",
    message: "b".repeat(MESSAGE_MAX_LENGTH + 1),
  });
  assert.equal(result.errors.name, "too_long");
  assert.equal(result.errors.email, "email");
  assert.equal(result.errors.message, "too_long");
});

test("a valid submission is trimmed and normalised", () => {
  const result = validateInquiry({
    name: "  A visitor  ",
    email: "  a@b.co ",
    category: "club",
    message: "  Please contact me.  ",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    name: "A visitor",
    email: "a@b.co",
    category: "club",
    message: "Please contact me.",
  });
});

test("values exactly at the limit are accepted", () => {
  const result = validateInquiry({
    name: "a".repeat(NAME_MAX_LENGTH),
    email: `${"a".repeat(EMAIL_MAX_LENGTH - 12)}@ex.com`,
    category: "other",
    message: "b".repeat(MESSAGE_MAX_LENGTH),
  });
  assert.equal(result.ok, true);
});

test("the honeypot marks a submission as automated", () => {
  assert.equal(
    validateInquiry({
      name: "A",
      email: "a@b.co",
      category: "fan",
      message: "Hello",
      company: "Acme Ltd",
    }).honeypot,
    true,
  );
  // Whitespace is not a filled honeypot.
  assert.equal(
    validateInquiry({
      name: "A",
      email: "a@b.co",
      category: "fan",
      message: "Hello",
      company: "   ",
    }).honeypot,
    false,
  );
});

/* --------------------------------------------------------------- configuration */

test("delivery stays unconfigured until all three variables are present", () => {
  assert.equal(resolveContactCredentials({}), null);
  assert.equal(resolveContactCredentials({ RESEND_API_KEY: "key" }), null);
  assert.equal(
    resolveContactCredentials({ RESEND_API_KEY: "key", CONTACT_TO_EMAIL: "a@b.com" }),
    null,
  );

  const config = resolveContactConfig({});
  assert.equal(config.isDeliveryConfigured, false);
  assert.equal(config.endpoint, "/api/contact");
  assert.ok(config.unavailableReason.en.length > 0);
  assert.ok(config.unavailableReason.ar.length > 0);
});

test("delivery is configured once every variable is present", () => {
  const env = {
    RESEND_API_KEY: "re_test",
    CONTACT_TO_EMAIL: "owner@example.com",
    CONTACT_FROM_EMAIL: "Portfolio <no-reply@example.com>",
  };
  assert.deepEqual(resolveContactCredentials(env), {
    apiKey: "re_test",
    to: "owner@example.com",
    from: "Portfolio <no-reply@example.com>",
  });
  assert.equal(resolveContactConfig(env).isDeliveryConfigured, true);
});

/* ---------------------------------------------------------------------- tokens */

test("a signed token verifies only within its age window", () => {
  const secret = "unit-test-secret";
  const now = 1_700_000_000_000;
  const token = createContactToken({ now, secret });
  assert.ok(token.includes("."));

  assert.equal(verifyContactToken(token, { now: now + TOKEN_MIN_AGE_MS, secret }), true);
  assert.equal(verifyContactToken(token, { now: now + TOKEN_MIN_AGE_MS - 1, secret }), false);
  assert.equal(verifyContactToken(token, { now: now + TOKEN_MAX_AGE_MS + 1, secret }), false);
});

test("a signed token fails on tampering or a wrong key", () => {
  const secret = "unit-test-secret";
  const now = 1_700_000_000_000;
  const token = createContactToken({ now, secret });
  const [issuedAt, mac] = token.split(".");

  assert.equal(issuedAt !== undefined && mac !== undefined, true);
  assert.equal(verifyContactToken(`${issuedAt}.${"a".repeat(64)}`, { now, secret }), false);
  assert.equal(verifyContactToken(`1${issuedAt}.${mac}`, { now, secret }), false);
  assert.equal(verifyContactToken(token, { now, secret: "another-secret" }), false);
  assert.equal(verifyContactToken("", { now, secret }), false);
  assert.equal(verifyContactToken({}, { now, secret }), false);
});

test("no token is issued when no secret is configured", () => {
  assert.equal(createContactToken({ secret: "" }), "");
  assert.equal(verifyContactToken("1700000000000.abc", { secret: "" }), false);
});

/* -------------------------------------------------------------- rate limiting */

test("the in-memory limiter blocks after the configured maximum", () => {
  resetRateLimit();
  const now = 1_000_000;

  for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
    assert.equal(rateLimitAllow("1.2.3.4", now + i).allowed, true);
  }

  const blocked = rateLimitAllow("1.2.3.4", now + RATE_LIMIT_MAX);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);

  // A different key is unaffected.
  assert.equal(rateLimitAllow("5.6.7.8", now).allowed, true);

  // The window resets.
  resetRateLimit();
  assert.equal(rateLimitAllow("1.2.3.4", now).allowed, true);
});

/* -------------------------------------------------------------------- delivery */

test("the outbound message keeps visitor input out of the headers", () => {
  const { subject, text } = buildInquiryEmail({
    name: "Visitor\nBcc: evil@example.com",
    email: "visitor@example.com",
    category: "club",
    message: "Body line",
  });

  assert.equal(subject, "New portfolio inquiry — Club or contract enquiry");
  // The visitor's newline-laden name must never reach a header.
  assert.equal(subject.includes("\n"), false);
  assert.ok(text.includes("Name: Visitor"));
  assert.ok(text.includes("Email: visitor@example.com"));
  assert.ok(text.includes("Body line"));
});

test("an accepted provider response is reported as success", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const result = await deliverInquiry(
    {
      apiKey: "re_test",
      to: "owner@example.com",
      from: "Portfolio <no-reply@example.com>",
    },
    {
      name: "Visitor",
      email: "visitor@example.com",
      category: "club",
      message: "Please contact me.",
    },
    {
      fetchImpl: async (input, init) => {
        calls.push({ url: String(input), init });
        return new Response(JSON.stringify({ id: "re_123" }), { status: 200 });
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);

  const call = calls[0];
  assert.equal(calls.length, 1);
  assert.equal(call?.url, "https://api.resend.com/emails");
  const body = JSON.parse(String(calls[0]?.init?.body));
  assert.equal(body.from, "Portfolio <no-reply@example.com>");
  assert.deepEqual(body.to, ["owner@example.com"]);
  assert.equal(body.reply_to, "visitor@example.com");
  assert.equal("text" in body, true);
});

test("a provider rejection is reported as a failure, not an error leak", () => {
  return deliverInquiry(
    { apiKey: "re_test", to: "owner@example.com", from: "a@b.com" },
    { name: "A", email: "a@b.co", category: "fan", message: "Hi" },
    {
      fetchImpl: async () =>
        new Response(JSON.stringify({ message: "domain not verified" }), {
          status: 403,
        }),
    },
  ).then((result) => {
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
  });
});

test("a network failure is reported without leaking the error", async () => {
  const rejected = (() =>
    Promise.reject(new Error("connect ECONNREFUSED"))) as unknown as typeof fetch;

  const result = await deliverInquiry(
    { apiKey: "re_test", to: "owner@example.com", from: "no-reply@example.com" },
    { name: "Visitor", email: "a@b.co", category: "other", message: "Hello" },
    { fetchImpl: rejected },
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, undefined);
});

/* -------------------------------------------------------------------- deployment */

test("only the production deployment is indexable", () => {
  assert.equal(isProductionDeployment({ VERCEL_ENV: "production" }), true);
  assert.equal(isProductionDeployment({ VERCEL_ENV: "preview" }), false);
  assert.equal(isProductionDeployment({ VERCEL_ENV: "development" }), false);
  assert.equal(isProductionDeployment({ NODE_ENV: "production" }), true);
  assert.equal(isProductionDeployment({ NODE_ENV: "development" }), false);
});

/* --------------------------------------------------------------- structured data */

test("structured data uses only published facts and claims no official status", () => {
  const data = buildPersonStructuredData("en", "Portfolio description");
  assert.equal(data["@type"], "Person");
  assert.equal(data.name, "Ahmed Said Shafik");
  assert.equal(data.birthDate, "1994-12-07");
  assert.equal("sameAs" in data, false);
  assert.ok(data.award.length > 0);

  const serialised = serializeStructuredData(data);
  assert.equal(serialised.includes("<"), false);
  assert.equal(serialised.toLowerCase().includes("official"), false);
});
