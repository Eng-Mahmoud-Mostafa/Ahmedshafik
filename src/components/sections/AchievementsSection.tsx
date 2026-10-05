"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content/types";
import {
  achievements,
  type AchievementCategory,
} from "@/content/achievements";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { EmptyState, SourceList, VerificationBadge } from "@/components/ui/Primitives";
import { cn } from "@/lib/cn";

type Filter = AchievementCategory | "all";

export function AchievementsSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const [filter, setFilter] = useState<Filter>("all");

  const published = useMemo(() => achievements.filter(isPubliclyRenderable), []);

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: t.achievements.filterAll },
    { id: "international", label: t.achievements.filterInternational },
    { id: "club", label: t.achievements.filterClub },
    { id: "individual", label: t.achievements.filterIndividual },
  ];

  const visible =
    filter === "all"
      ? published
      : published.filter((entry) => entry.category === filter);

  return (
    <SectionShell id={SECTION_IDS.achievements} labelledBy="achievements-heading">
      <SectionHeading
        id="achievements-heading"
        eyebrow={t.achievements.eyebrow}
        title={t.achievements.title}
        description={t.achievements.disclaimer}
      />

      <div
        role="group"
        aria-label={t.achievements.title}
        className="mt-10 flex flex-wrap gap-2"
      >
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors rtl:tracking-normal",
                active
                  ? "border-gold bg-gold/12 text-gold"
                  : "border-charcoal-line text-bone-muted hover:border-bone-faint hover:text-bone",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8" aria-live="polite">
        {visible.length === 0 ? (
          <EmptyState
            title={t.achievements.emptyTitle}
            body={t.achievements.emptyBody}
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {visible.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-3 rounded-2xl border border-charcoal-line bg-charcoal/40 p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-sm font-bold tracking-[0.2em] text-gold uppercase rtl:tracking-normal">
                    {entry.year}
                  </span>
                  <VerificationBadge status={entry.verification} label={t.profile.verified} />
                </div>
                <h3 className="font-display text-xl font-semibold text-bone">
                  {pick(entry.title, locale)}
                </h3>
                <p className="text-sm leading-relaxed text-bone-muted">
                  {pick(entry.context, locale)}
                </p>
                <SourceList
                  sources={entry.sources}
                  label={t.profile.sourcesLabel}
                  className="mt-auto pt-2"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}