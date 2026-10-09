"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content/types";
import { press, publishedPressKinds, type PressEntry, type PressKind } from "@/content/press";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/cn";
import { formatISODate } from "@/lib/utils";

type Filter = "all" | PressKind;

/**
 * Press coverage and official video highlights.
 *
 * Every card is an outbound link to the publisher's own page; no article text or
 * third-party image is copied. Filters are derived from the kinds actually
 * present, so an empty category is never advertised.
 */
export function PressGrid({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo(() => press.filter(isPubliclyRenderable), []);
  const kinds = useMemo(() => publishedPressKinds(entries), [entries]);

  const kindLabel: Record<PressKind, string> = {
    video: t.media.kindVideo,
    news: t.media.kindNews,
    interview: t.media.kindInterview,
  };

  const filterLabel: Record<PressKind, string> = {
    video: t.media.filterVideo,
    news: t.media.filterNews,
    interview: t.media.filterInterview,
  };

  const visible =
    filter === "all" ? entries : entries.filter((entry) => entry.kind === filter);

  if (entries.length === 0) {
    return (
      <EmptyState
        title={t.media.pressEmptyTitle}
        body={t.media.pressEmptyBody}
        className="max-w-3xl"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {kinds.length > 1 ? (
        <div role="group" aria-label={t.media.pressLabel} className="flex flex-wrap gap-2">
          {(
            [
              ["all", t.media.filterAll] as const,
              ...kinds.map((kind) => [kind, filterLabel[kind]] as const),
            ] as ReadonlyArray<readonly [Filter, string]>
          ).map(([id, label]) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-xs font-semibold tracking-[0.14em] uppercase transition-colors rtl:tracking-normal",
                  active
                    ? "border-gold bg-gold/12 text-gold"
                    : "border-charcoal-line text-bone-muted hover:border-bone-faint hover:text-bone",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((entry) => (
          <PressCard
            key={entry.id}
            entry={entry}
            locale={locale}
            kindLabel={kindLabel[entry.kind]}
            openLabel={t.media.openSource}
            publishedLabel={t.media.publishedLabel}
          />
        ))}
      </ul>

      <p className="text-xs text-bone-faint">{t.media.externalNote}</p>
    </div>
  );
}

function PressCard({
  entry,
  locale,
  kindLabel,
  openLabel,
  publishedLabel,
}: {
  entry: PressEntry;
  locale: Locale;
  kindLabel: string;
  openLabel: string;
  publishedLabel: string;
}) {
  return (
    <li>
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col gap-4 rounded-2xl border border-charcoal-line bg-charcoal/40 p-6 transition-colors hover:border-gold/50 hover:bg-charcoal/70 focus-visible:border-gold"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.16em] uppercase rtl:tracking-normal",
              entry.kind === "video"
                ? "border-egypt-red/45 bg-egypt-red/10 text-egypt-red-soft"
                : "border-gold/30 bg-gold/8 text-gold",
            )}
          >
            {entry.kind === "video" ? (
              <span aria-hidden="true" className="text-[0.7rem] leading-none">
                ▶
              </span>
            ) : null}
            {kindLabel}
          </span>
          <span className="text-xs text-bone-faint">{entry.outlet}</span>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-bone">
            {pick(entry.title, locale)}
          </h3>
          <p className="text-sm leading-relaxed text-bone-muted">
            {pick(entry.summary, locale)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-bone-faint">
            {publishedLabel} · {formatISODate(entry.dateISO, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
            {openLabel}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
              ↗
            </span>
          </span>
        </div>
      </a>
    </li>
  );
}
