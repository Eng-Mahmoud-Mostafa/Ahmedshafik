import type { Locale } from "@/content/types";
import { career, type CareerCategory } from "@/content/career";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { EmptyState, SourceList, VerificationBadge } from "@/components/ui/Primitives";

const CATEGORY_LABEL: Record<CareerCategory, { en: string; ar: string }> = {
  national: { en: "National team", ar: "المنتخب" },
  club: { en: "Club", ar: "النادي" },
  education: { en: "Education", ar: "التعليم" },
};

export function CareerSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const entries = career.filter(isPubliclyRenderable);

  return (
    <SectionShell id={SECTION_IDS.career} labelledBy="career-heading">
      <SectionHeading
        id="career-heading"
        eyebrow={t.career.eyebrow}
        title={t.career.title}
      />

      <div className="mt-14">
        {entries.length === 0 ? (
          <EmptyState title={t.career.emptyTitle} body={t.career.emptyBody} />
        ) : (
          <ol className="relative flex flex-col gap-8 border-s border-charcoal-line ps-6 sm:ps-10">
            {entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -start-[1.85rem] top-2 size-2.5 rounded-full bg-egypt-red shadow-glow-red sm:-start-[2.65rem]"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-sm font-bold tracking-[0.2em] text-gold uppercase rtl:tracking-normal">
                    {pick(entry.periodLabel, locale)}
                  </span>
                  <span className="rounded-full border border-charcoal-line px-2.5 py-1 text-[0.6rem] tracking-[0.18em] text-bone-faint uppercase rtl:tracking-normal">
                    {pick(CATEGORY_LABEL[entry.category], locale)}
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

                <h3 className="mt-3 font-display text-2xl font-semibold text-bone">
                  {pick(entry.title, locale)}
                </h3>
                <p className="mt-1 text-sm text-bone-muted">
                  {pick(entry.organisation, locale)}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone/80">
                  {pick(entry.detail, locale)}
                </p>

                {entry.highlight ? (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/8 px-3 py-1.5 text-xs font-semibold text-gold">
                    {pick(entry.highlight, locale)}
                  </p>
                ) : null}

                <SourceList
                  sources={entry.sources}
                  label={t.profile.sourcesLabel}
                  className="mt-4"
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </SectionShell>
  );
}