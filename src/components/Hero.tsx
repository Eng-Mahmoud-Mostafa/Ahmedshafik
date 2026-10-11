"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Locale } from "@/content/types";
import { heroFacts } from "@/content/profile";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { useLocale } from "@/i18n/LocaleProvider";
import { SECTION_IDS, type SceneTarget } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/media";
import { focusSection } from "@/lib/utils";
import { SceneLoading } from "@/components/scene/SceneStatus";
import { ScenePanel, type PanelId } from "@/components/scene/ScenePanels";
import { useExclusivePanel } from "@/components/scene/SceneDialog";

/**
 * The dynamic load placeholder reads the active locale from context rather than
 * hardcoding English, so an Arabic visit never flashes an English loading line.
 */
function SceneStageLoading() {
  const { locale } = useLocale();
  const t = dictionaryFor(locale);
  return (
    <div className="overflow-hidden rounded-3xl border border-charcoal-line">
      <SceneLoading
        title={t.scene.panelLoading}
        hint={t.scene.loadingHint}
        className="h-[32rem] rounded-none border-0"
      />
    </div>
  );
}

const SceneStage = dynamic(
  () => import("@/components/scene/SceneStage").then((mod) => mod.SceneStage),
  {
    ssr: false,
    loading: () => <SceneStageLoading />,
  },
);

export function Hero({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const reducedMotion = usePrefersReducedMotion();
  const panel = useExclusivePanel<PanelId>();
  const [highlighted, setHighlighted] = useState<SceneTarget["kind"] | null>(null);

  const goTo = useCallback(
    (sectionId: string) => {
      focusSection(sectionId, reducedMotion);
    },
    [reducedMotion],
  );

  /**
   * Every hotspot opens its panel rather than jumping straight to a section.
   *
   * The panels are the richer reading experience and each one links onward to its
   * full section, so nothing is only one interaction deep.
   */
  const handleSceneSelect = useCallback(
    (target: SceneTarget) => {
      panel.toggle(target.kind);
      setHighlighted(null);
    },
    [panel],
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
        {/*
          The copy column comes first in the DOM, so on mobile the headline sits
          above the scene and the composition reads top to bottom.
        */}
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
              className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-egypt-red px-7 py-3.5 text-sm font-semibold text-bone shadow-glow-red transition-transform hover:-translate-y-0.5"
            >
              {t.hero.exploreStory}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => goTo(SECTION_IDS.achievements)}
              className="inline-flex min-h-11 items-center gap-3 rounded-full border border-charcoal-line px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-gold hover:text-gold"
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
            highlighted={highlighted}
            onHighlight={setHighlighted}
            openPanel={panel.open}
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

      <ScenePanel
        panel={panel.open}
        onClose={panel.close}
        onGoToSection={goTo}
        locale={locale}
      />
    </section>
  );
}