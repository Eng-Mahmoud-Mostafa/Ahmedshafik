import type { Locale } from "@/content/types";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie read on the server so the correct language is rendered on first paint. */
export const LOCALE_COOKIE = "ash_locale";

export const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "ar";

export const directionFor = (locale: Locale): "ltr" | "rtl" =>
  locale === "ar" ? "rtl" : "ltr";

export const htmlLangFor = (locale: Locale): "en" | "ar" => locale;