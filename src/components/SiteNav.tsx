"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { dictionaryFor } from "@/i18n/dictionary";
import type { Locale } from "@/content/types";
import { SECTION_IDS } from "@/lib/sections";
import { focusSection } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/media";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { id: SECTION_IDS.profile, key: "profile" },
  { id: SECTION_IDS.career, key: "career" },
  { id: SECTION_IDS.achievements, key: "achievements" },
  { id: SECTION_IDS.media, key: "media" },
  { id: SECTION_IDS.contact, key: "contact" },
] as const;

export function SiteNav() {
  const { locale, setLocale } = useLocale();
  const t = dictionaryFor(locale);
  const reducedMotion = usePrefersReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    focusSection(id, reducedMotion);
  };

  const languageButton = (target: Locale) => (
    <button
      type="button"
      onClick={() => setLocale(target)}
      aria-label={`${t.nav.switchTo} ${target === "ar" ? "العربية" : "English"}`}
      aria-pressed={locale === target}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors rtl:tracking-normal",
        locale === target
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-charcoal-line text-bone-muted hover:border-bone-faint hover:text-bone",
      )}
    >
      {target === "ar" ? "ع" : "EN"}
    </button>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || menuOpen
          ? "border-b border-charcoal-line/80 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label={t.nav.navLabel}
        className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12"
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
          className="group flex items-center gap-3 text-start"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full border border-egypt-red/50 bg-egypt-red/10 font-display text-sm font-bold text-egypt-red-soft"
          >
            18
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-sm font-bold tracking-[0.2em] text-bone uppercase rtl:tracking-normal">
              Ahmed Shafik
            </span>
            <span className="text-[0.6rem] tracking-[0.3em] text-bone-faint uppercase rtl:tracking-normal">
              {t.hero.eyebrow}
            </span>
          </span>
        </button>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                className="text-sm text-bone-muted transition-colors hover:text-bone"
              >
                {t.nav[item.key]}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label={t.nav.languageLabel}
            className="hidden items-center gap-2 sm:flex"
          >
            {languageButton("en")}
            {languageButton("ar")}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="flex size-10 items-center justify-center rounded-full border border-charcoal-line text-bone transition-colors hover:border-bone-faint lg:hidden"
          >
            <span aria-hidden="true" className="flex flex-col gap-1">
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  menuOpen && "translate-y-[3px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  menuOpen && "-translate-y-[3px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-charcoal-line/80 bg-ink/95 backdrop-blur-xl lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[88rem] flex-col px-5 py-4 sm:px-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.id} className="border-b border-charcoal-line/50 last:border-0">
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className="flex w-full items-center justify-between py-4 text-start text-lg text-bone"
                >
                  {t.nav[item.key]}
                  <span aria-hidden="true" className="text-egypt-red">
                    →
                  </span>
                </button>
              </li>
            ))}
            <li className="flex items-center gap-2 pt-4 sm:hidden">
              <span className="me-2 text-xs tracking-[0.2em] text-bone-faint uppercase rtl:tracking-normal">
                {t.nav.languageLabel}
              </span>
              {languageButton("en")}
              {languageButton("ar")}
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}