import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  directionFor,
  htmlLangFor,
  isLocale,
  LOCALE_COOKIE,
} from "./config";
import type { Locale } from "@/content/types";

/**
 * Reads the visitor's locale on the server so the first paint already has the
 * right language and text direction — no flash of English on an Arabic visit.
 */
export const getRequestLocale = async (): Promise<Locale> => {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
};

export const getDirection = (locale: Locale) => directionFor(locale);
export const getHtmlLang = (locale: Locale) => htmlLangFor(locale);