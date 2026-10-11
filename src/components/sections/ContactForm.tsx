"use client";

import { useId, useState, type FormEvent } from "react";
import type { Locale } from "@/content/types";
import {
  HONEYPOT_FIELD,
  inquiryCategories,
  MESSAGE_MAX_LENGTH,
  validateInquiry,
  type InquiryCategory,
  type InquiryErrorCode,
} from "@/content/contact";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { cn } from "@/lib/cn";

interface FormValues {
  name: string;
  email: string;
  category: InquiryCategory | "";
  message: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: FormValues = { name: "", email: "", category: "", message: "" };

const errorMessage = (
  code: InquiryErrorCode,
  t: ReturnType<typeof dictionaryFor>["contact"],
): string => {
  switch (code) {
    case "required":
      return t.errorRequired;
    case "email":
      return t.errorEmail;
    case "category":
      return t.errorCategory;
    case "too_long":
      return t.errorTooLong;
  }
};

/** Maps the shared validation result onto localised field messages. */
const validate = (values: FormValues, locale: Locale): FieldErrors => {
  const { contact } = dictionaryFor(locale);
  const result = validateInquiry(values);
  const errors: FieldErrors = {};

  (Object.keys(result.errors) as Array<keyof FormValues>).forEach((field) => {
    const code = result.errors[field as keyof typeof result.errors];
    if (code) errors[field] = errorMessage(code, contact);
  });

  return errors;
};

const fieldClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-ink-soft px-4 py-3 text-sm text-bone outline-none transition-colors placeholder:text-bone-faint/70",
    "focus:border-gold",
    invalid ? "border-egypt-red" : "border-charcoal-line",
  );

/**
 * Accessible inquiry form.
 *
 * The same validation the server runs is applied here first, so the common
 * mistakes are caught before a request is made. When the form is not configured
 * the submit button stays disabled and the reason is stated plainly — no success
 * state is ever simulated. When it is configured, success is shown only after
 * the server confirms the email provider accepted the message.
 */
export function ContactForm({
  locale,
  deliveryConfigured,
  endpoint,
  token,
}: {
  locale: Locale;
  deliveryConfigured: boolean;
  endpoint: string;
  token: string;
}) {
  const t = dictionaryFor(locale);
  const formId = useId();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const fieldId = (name: string) => `${formId}-${name}`;
  const errorId = (name: string) => `${formId}-${name}-error`;

  const busy = status === "submitting";

  const update = (name: keyof FormValues, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      setErrors(validate(next, locale));
    }
  };

  const blur = (name: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values, locale));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deliveryConfigured || busy) return;

    const nextErrors = validate(values, locale);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, category: true, message: true });
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: honeypot, token }),
      });

      const payload: unknown = await response.json().catch(() => null);
      const accepted =
        response.ok &&
        typeof payload === "object" &&
        payload !== null &&
        (payload as { ok?: unknown }).ok === true;

      if (accepted) {
        setValues(EMPTY);
        setTouched({});
        setErrors({});
        setSubmitError(null);
        setStatus("success");
        return;
      }

      setSubmitError(t.contact.errorSubmit);
      setStatus("error");
    } catch {
      setSubmitError(t.contact.errorSubmit);
      setStatus("error");
    }
  };

  const describedBy = (name: keyof FormValues) =>
    errors[name] ? errorId(name) : undefined;

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-2xl border border-gold/30 bg-gold/6 p-6"
      >
        <div className="flex flex-col gap-2">
          <p className="font-display text-lg font-semibold text-gold">
            {t.contact.successTitle}
          </p>
          <p className="text-sm leading-relaxed text-bone-muted">
            {t.contact.successBody}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="rounded-full border border-charcoal-line px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:border-gold hover:text-gold"
        >
          {t.contact.successReset}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-6">
      {/* ---------------------------------------------------- availability */}
      {!deliveryConfigured ? (
        <div role="note" className="rounded-2xl border border-gold/25 bg-gold/6 p-5">
          <p className="text-sm font-semibold text-gold">
            {t.contact.unavailableTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-bone-muted">
            {t.contact.unavailableBody}
          </p>
        </div>
      ) : null}

      {/* -------------------------------------------------------- submission */}
      {status === "error" && submitError ? (
        <div
          role="alert"
          className="rounded-2xl border border-egypt-red/40 bg-egypt-red/10 p-4"
        >
          <p className="text-sm font-semibold text-egypt-red-soft">
            {t.contact.errorTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-bone-muted">{submitError}</p>
        </div>
      ) : null}

      {/* Honeypot: hidden from view and assistive technology, tempting to bots. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor={fieldId("company")}>{t.contact.honeypotLabel}</label>
        <input
          id={fieldId("company")}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>
      <input type="hidden" name="token" value={token} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={fieldId("name")} className="text-xs font-semibold text-bone-muted">
            {t.contact.nameLabel}
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={fieldClass(Boolean(errors.name && touched.name))}
          />
          {errors.name && touched.name ? (
            <p id={errorId("name")} role="alert" className="text-xs text-egypt-red-soft">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={fieldId("email")} className="text-xs font-semibold text-bone-muted">
            {t.contact.emailLabel}
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={fieldClass(Boolean(errors.email && touched.email))}
          />
          {errors.email && touched.email ? (
            <p id={errorId("email")} role="alert" className="text-xs text-egypt-red-soft">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId("category")} className="text-xs font-semibold text-bone-muted">
          {t.contact.categoryLabel}
        </label>
        <select
          id={fieldId("category")}
          name="category"
          value={values.category}
          onChange={(event) => update("category", event.target.value)}
          onBlur={() => blur("category")}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={describedBy("category")}
          className={fieldClass(Boolean(errors.category && touched.category))}
        >
          <option value="">{t.contact.categoryPlaceholder}</option>
          {inquiryCategories.map((option) => (
            <option key={option.value} value={option.value}>
              {pick(option.label, locale)}
            </option>
          ))}
        </select>
        {errors.category && touched.category ? (
          <p id={errorId("category")} role="alert" className="text-xs text-egypt-red-soft">
            {errors.category}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId("message")} className="text-xs font-semibold text-bone-muted">
          {t.contact.messageLabel}
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX_LENGTH}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          onBlur={() => blur("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={`${fieldId("message-hint")}${describedBy("message") ? ` ${describedBy("message")}` : ""}`}
          className={cn(fieldClass(Boolean(errors.message && touched.message)), "resize-y")}
        />
        <p id={`${fieldId("message-hint")}`} className="text-xs text-bone-faint">
          {t.contact.messageHint} · {values.message.length}/{MESSAGE_MAX_LENGTH}
        </p>
        {errors.message && touched.message ? (
          <p id={errorId("message")} role="alert" className="text-xs text-egypt-red-soft">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!deliveryConfigured || busy}
          aria-disabled={!deliveryConfigured || busy}
          className={cn(
            "inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors",
            deliveryConfigured && !busy
              ? "bg-egypt-red text-bone hover:bg-egypt-red-deep"
              : "cursor-not-allowed border border-charcoal-line text-bone-faint",
          )}
        >
          {busy ? (
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-bone-faint border-t-transparent"
            />
          ) : null}
          {!deliveryConfigured
            ? t.contact.submitDisabled
            : busy
              ? t.contact.sending
              : t.contact.submit}
        </button>
      </div>
    </form>
  );
}
