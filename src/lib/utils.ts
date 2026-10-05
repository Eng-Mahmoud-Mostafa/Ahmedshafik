import type { Locale } from "@/content/types";

/**
 * Smooth-scrolls to a section and moves focus there, so keyboard and screen
 * reader users follow the same path as pointer users.
 */
export const focusSection = (sectionId: string, reducedMotion: boolean): void => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  element.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });

  if (!element.hasAttribute("tabindex")) {
    element.setAttribute("tabindex", "-1");
  }
  // Defer focus until the smooth scroll settles to avoid a focus jump.
  window.setTimeout(() => element.focus({ preventScroll: true }), reducedMotion ? 0 : 420);
};

/** Locale-aware display for a jersey number: `18` / `١٨`. */
export const formatNumber = (value: number, locale: Locale): string => {
  if (locale === "en") return String(value);
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(value).replace(/\d/g, (d) => digits[Number(d)] ?? d);
};