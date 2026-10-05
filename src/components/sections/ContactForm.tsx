"use client";

import { useId, useState, type FormEvent } from "react";
import type { Locale } from "@/content/types";
import {
  inquiryCategories,
  MESSAGE_MAX_LENGTH,
  type InquiryCategory,
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

const EMPTY: FormValues = { name: "", email: "", category: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Deliberately permissive but structural: rejects obvious typos, not valid addresses. */
const validate = (values: FormValues, locale: Locale): FieldErrors => {
  const t = dictionaryFor(locale);
  const errors: FieldErrors = {};

  if (values.name.trim().length === 0) errors.name = t.contact.errorRequired;
  if (values.email.trim().length === 0) {
    errors.email = t.contact.errorRequired;
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = t.contact.errorEmail;
  }
  if (!values.category) errors.category = t.contact.errorCategory;
  if (values.message.trim().length === 0) {
    errors.message = t.contact.errorRequired;
  } else if (values.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = t.contact.errorTooLong;
  }

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
 * When `deliveryConfigured` is false the submit button is disabled and the
 * reason is stated plainly. No request is made and no success state is ever
 * simulated — the stage-two server endpoint does not exist yet.
 */
export function ContactForm({
  locale,
  deliveryConfigured,
  endpoint,
}: {
  locale: Locale;
  deliveryConfigured: boolean;
  endpoint: string;
}) {
  const t = dictionaryFor(locale);
  const formId = useId();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  const fieldId = (name: string) => `${formId}-${name}`;
  const errorId = (name: string) => `${formId}-${name}-error`;

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deliveryConfigured) return;

    const nextErrors = validate(values, locale);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, category: true, message: true });
    if (Object.keys(nextErrors).length > 0) return;

    // Stage two: POST to the server endpoint that forwards to an email service.
    // Intentionally not implemented here — nothing is sent in stage one.
    void endpoint;
  };

  const describedBy = (name: keyof FormValues) =>
    errors[name] ? errorId(name) : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {/* ---------------------------------------------------- availability */}
      <div
        role="note"
        className="rounded-2xl border border-gold/25 bg-gold/6 p-5"
      >
        <p className="text-sm font-semibold text-gold">{t.contact.unavailableTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-bone-muted">
          {t.contact.unavailableBody}
        </p>
      </div>

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
          disabled={!deliveryConfigured}
          aria-disabled={!deliveryConfigured}
          className={cn(
            "rounded-full px-7 py-3.5 text-sm font-semibold transition-colors",
            deliveryConfigured
              ? "bg-egypt-red text-bone hover:bg-egypt-red-deep"
              : "cursor-not-allowed border border-charcoal-line text-bone-faint",
          )}
        >
          {deliveryConfigured ? t.contact.submit : t.contact.submitDisabled}
        </button>
        <p className="text-xs text-bone-faint">{t.contact.unavailableBody}</p>
      </div>
    </form>
  );
}