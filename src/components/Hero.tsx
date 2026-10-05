"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Locale } from "@/content/types";
import { heroFacts } from "@/content/profile";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS, sceneTargetToSection, type SceneTarget } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/media";
import { SceneLoading } from "@/components/scene/SceneStatus";
import { BeyondCourtPanel } from "@/components/scene/SceneInteractions";

const SceneStage = dynamic(
  () => import("@/components/scene/SceneStage").then((mod) => mod.SceneStage),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-3xl border border-charcoal-line">
        <SceneLoading
          title={dictionaryFor("en").scene.loading}
          hint={dictionaryFor("en").scene.loadingHint}
          className="h-[32rem] rounded-none border-0"
        />
      </div>
    ),
  },
);

export function Hero({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const reducedMotion = usePrefersReducedMotion();
  const [panelOpen, setPanelOpen] = useState(false);

  const goTo = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (!element) return;
      element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
      window.setTimeout(
        () => element.focus({ preventScroll: true }),
        reducedMotion ? 0 : 420,
      );
    },
    [reducedMotion],
  );

  const handleSceneSelect = useCallback(
    (target: SceneTarget) => {
      const section = sceneTargetToSection[target.kind];
      if (target.kind === "beyond") {
        setPanelOpen(true);
        return;
      }
      if (section) goTo(section);
    },
    [goTo],
  );

  const sceneLabels = {
    journey: t.scene.journey,
    profile: t.scene.playerProfile,
    beyond: t.scene.beyondCourt,
    trophy: t.scene.trophy,
    trophyNote: t.scene.trophyNote,
    medal: t.scene.medal,
    medalNote: t.scene.medalNote,
  };

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 lg:pt-40 lg:pb-24">
      <div aria-hidden="true" className="grain absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(ellipse_at_top,rgba(206,17,38,0.14),transparent_62%)]"
      />

      <div className="mx-auto grid w-full max-w-[88rem] gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:px-12">
        {/* ------------------------------------------------------------- copy */}
        <div className="flex flex-col gap-8">
          <p className="eyebrow flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block h-px w-10 bg-gradient-to-r from-egypt-red to-transparent rtl:bg-gradient-to-l"
            />
            {t.hero.eyebrow}
          </p>

          <h1 className="display-headline text-[clamp(3.25rem,13vw,10.5rem)] text-bone">
            <span className="block">{t.hero.titleLineOne}</span>
            <span className="block text-egypt-red">{t.hero.titleLineTwo}</span>
          </h1>

          <p className="max-w-xl text-lg text-bone-muted sm:text-xl">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(SECTION_IDS.career)}
              className="group inline-flex items-center gap-3 rounded-full bg-egypt-red px-7 py-3.5 text-sm font-semibold text-bone shadow-glow-red transition-transform hover:-translate-y-0.5"
            >
              {t.hero.exploreStory}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => goTo(SECTION_IDS.achievements)}
              className="inline-flex items-center gap-3 rounded-full border border-charcoal-line px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-gold hover:text-gold"
            >
              {t.hero.viewAchievements}
            </button>
          </div>

          {/* facts strip */}
          <dl className="mt-4 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal-line sm:grid-cols-3">
            {heroFacts.map((fact) => (
              <div key={fact.id} className="bg-ink-soft px-5 py-5">
                <dt className="eyebrow">{pick(fact.label, locale)}</dt>
                <dd
                  className={cn(
                    "mt-2 font-display text-xl font-bold tracking-wide",
                    fact.tone === "red"
                      ? "text-egypt-red-soft"
                      : fact.tone === "gold"
                        ? "text-gold"
                        : "text-bone",
                  )}
                >
                  {pick(fact.value, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ------------------------------------------------------------ scene */}
        <div className="flex flex-col gap-5">
          <SceneStage
            locale={locale}
            labels={sceneLabels}
            onSelect={handleSceneSelect}
            loadingTitle={t.scene.loading}
            loadingHint={t.scene.loadingHint}
            unsupportedTitle={t.scene.unsupportedTitle}
            unsupportedBody={t.scene.unsupportedBody}
            className="flex flex-col gap-5"
          />
          <p className="text-xs leading-relaxed text-bone-faint">
            {t.scene.characterNote}
          </p>
        </div>
      </div>

      <BeyondCourtPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        locale={locale}
      />
    </section>
  );
}