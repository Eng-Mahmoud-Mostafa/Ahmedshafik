"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content/types";
import {
  achievements,
  archiveGroups,
  archiveTotals,
  type AchievementEntry,
  type ArchiveGroups,
} from "@/content/achievements";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { SourceList, VerificationBadge } from "@/components/ui/Primitives";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/utils";

type GroupId = keyof ArchiveGroups;
type Filter = "all" | GroupId;

const GROUP_ORDER: GroupId[] = [
  "clubTitles",
  "nationalResults",
  "individualAwards",
  "internationalAppearances",
];

export function AchievementsSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const [filter, setFilter] = useState<Filter>("all");

  const published = useMemo(() => achievements.filter(isPubliclyRenderable), []);
  const groups = useMemo(() => archiveGroups(published), [published]);
  const totals = useMemo(() => archiveTotals(groups), [groups]);

  const groupLabel: Record<GroupId, string> = {
    clubTitles: t.achievements.groupClubTitles,
    nationalResults: t.achievements.groupNationalResults,
    individualAwards: t.achievements.groupIndividualAwards,
    internationalAppearances: t.achievements.groupInternationalAppearances,
  };

  const recordTypeLabel: Record<AchievementEntry["recordType"], string> = {
    title: t.achievements.recordTitle,
    medal: t.achievements.recordMedal,
    award: t.achievements.recordAward,
    appearance: t.achievements.recordAppearance,
  };

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: t.achievements.filterAll },
    { id: "clubTitles", label: t.achievements.filterClubTitles },
    { id: "nationalResults", label: t.achievements.filterNationalResults },
    { id: "individualAwards", label: t.achievements.filterIndividualAwards },
    { id: "internationalAppearances", label: t.achievements.filterInternationalAppearances },
  ];

  const visibleGroups = filter === "all" ? GROUP_ORDER : [filter];
  const totalCount = published.length;

  const renderCard = (entry: AchievementEntry) => (
    <li
      key={entry.id}
      className="flex flex-col gap-3 rounded-2xl border border-charcoal-line bg-charcoal/40 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-sm font-bold tracking-[0.2em] text-gold uppercase rtl:tracking-normal">
          {formatNumber(entry.year, locale)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/30 bg-gold/8 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.16em] text-gold uppercase rtl:tracking-normal">
            {recordTypeLabel[entry.recordType]}
          </span>
          <VerificationBadge
            status={entry.verification}
            label={
              entry.verification === "owner-approved"
                ? t.profile.ownerApproved
                : t.profile.verified
            }
          />
        </div>
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
  );

  return (
    <SectionShell id={SECTION_IDS.achievements} labelledBy="achievements-heading">
      <SectionHeading
        id="achievements-heading"
        eyebrow={t.achievements.eyebrow}
        title={t.achievements.title}
        description={t.achievements.disclaimer}
      />

      {totalCount > 0 ? (
        <>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal-line lg:grid-cols-4">
            {(
              [
                ["clubTitles", totals.clubTitles],
                ["nationalResults", totals.nationalResults],
                ["individualAwards", totals.individualAwards],
                ["internationalAppearances", totals.internationalAppearances],
              ] as Array<[GroupId, number]>
            ).map(([id, count]) => (
              <div key={id} className="bg-ink-soft px-5 py-6">
                <dd className="font-display text-3xl font-bold text-gold">
                  {formatNumber(count, locale)}
                </dd>
                <dt className="mt-2 text-[0.62rem] leading-snug tracking-[0.16em] text-bone-faint uppercase rtl:tracking-normal">
                  {groupLabel[id]}
                </dt>
              </div>
            ))}
          </dl>

          <div
            role="group"
            aria-label={t.achievements.filterLabel}
            className="mt-8 flex flex-wrap gap-2"
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
                    "min-h-11 rounded-full border px-4 text-xs font-semibold tracking-[0.14em] uppercase transition-colors rtl:tracking-normal",
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
        </>
      ) : null}

      <div className="mt-10 flex flex-col gap-14" aria-live="polite">
        {totalCount === 0 ? (
          <p className="rounded-2xl border border-dashed border-charcoal-line bg-charcoal/40 p-8 text-sm text-bone-muted">
            {t.achievements.emptyBody}
          </p>
        ) : (
          visibleGroups.map((id) => {
            const entries = groups[id];
            return (
              <section key={id} className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl font-semibold text-bone">
                    {groupLabel[id]}
                  </h3>
                  <span className="text-xs text-bone-faint">
                    {formatNumber(entries.length, locale)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-charcoal-line"
                  />
                </div>

                {entries.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-charcoal-line px-5 py-4 text-sm text-bone-muted">
                    {t.achievements.emptyTitle}
                  </p>
                ) : (
                  <ul className="grid gap-5 md:grid-cols-2">{entries.map(renderCard)}</ul>
                )}
              </section>
            );
          })
        )}
      </div>

      {groups.internationalAppearances.length > 0 ? (
        <p className="mt-10 rounded-2xl border border-gold/25 bg-gold/6 px-5 py-4 text-xs leading-relaxed text-bone-muted">
          {t.achievements.appearancesNote}
        </p>
      ) : null}
    </SectionShell>
  );
}
