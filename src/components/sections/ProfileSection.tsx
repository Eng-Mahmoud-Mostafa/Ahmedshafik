import type { Locale } from "@/content/types";
import { calculateAge, formatAge, formatHeight, heroFacts, profile } from "@/content/profile";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { SourceList, VerificationBadge } from "@/components/ui/Primitives";
import { cn } from "@/lib/cn";

/** `7 December 1994` localised without pulling in an Intl date bundle. */
const formatDateOfBirth = (iso: string, locale: Locale): string => {
  const [year, month, day] = iso.split("-").map(Number);
  const months = {
    en: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    ar: [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    ],
  } as const;

  if (locale === "ar") {
    const digits = "٠١٢٣٤٥٦٧٨٩";
    const eastern = String(day).replace(/\d/g, (d) => digits[Number(d)]);
    const easternYear = String(year).replace(/\d/g, (d) => digits[Number(d)]);
    return `${eastern} ${months.ar[month - 1]} ${easternYear}`;
  }
  return `${day} ${months.en[month - 1]} ${year}`;
};

export function ProfileSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const age = formatAge(calculateAge(profile.dateOfBirthISO), locale);

  const facts = [
    { label: t.profile.nameLabel, value: profile.name },
    { label: t.profile.arabicLabel, value: profile.nameArabic, rtlValue: true },
    { label: t.profile.professionalLabel, value: profile.professionalName },
    { label: t.profile.nationalityLabel, value: pick(profile.nationality, locale) },
    { label: t.profile.positionLabel, value: pick(profile.position, locale) },
    {
      label: t.profile.dobLabel,
      value: formatDateOfBirth(profile.dateOfBirthISO, locale),
    },
    { label: t.profile.ageLabel, value: age },
    { label: t.profile.heightLabel, value: pick(formatHeight(profile.heightCm), locale) },
  ];

  return (
    <SectionShell id={SECTION_IDS.profile} labelledBy="profile-heading">
      <SectionHeading
        id="profile-heading"
        eyebrow={t.profile.eyebrow}
        title={t.profile.title}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        {/* biography + competition records */}
        <div className="flex flex-col gap-10">
          <article className="flex flex-col gap-4">
            <h3 className="eyebrow">{t.profile.biographyLabel}</h3>
            <p className="text-lg leading-relaxed text-bone/90 sm:text-xl sm:leading-relaxed">
              {pick(profile.biography, locale)}
            </p>
          </article>

          <article className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="eyebrow">{t.profile.competitionsLabel}</h3>
              <VerificationBadge status="verified" label={t.profile.verified} />
            </div>

            <ul className="flex flex-col gap-4">
              {profile.competitionEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-charcoal-line bg-charcoal/40 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-bone">
                        {pick(entry.competition, locale)}
                      </p>
                      <p className="mt-1 text-sm text-bone-muted">
                        {pick(entry.team, locale)} · {entry.year}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 rounded-xl border border-gold/30 bg-gold/8 px-4 py-2 sm:items-end">
                      <span className="text-[0.6rem] tracking-[0.18em] text-gold uppercase rtl:tracking-normal">
                        {t.profile.jerseyLabel}
                      </span>
                      <span className="font-display text-2xl font-bold text-gold">
                        {entry.jerseyNumber}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-bone-muted">
                    {pick(entry.note, locale)}
                  </p>

                  <SourceList
                    sources={entry.sources}
                    label={t.profile.sourcesLabel}
                    className="mt-4 border-t border-charcoal-line pt-4"
                  />
                </li>
              ))}
            </ul>

            <p className="text-xs text-bone-faint">{t.profile.scopeNote}</p>
          </article>
        </div>

        {/* facts */}
        <div className="flex flex-col gap-6">
          <h3 className="eyebrow">{t.profile.factsLabel}</h3>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal-line">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-ink-soft px-4 py-5">
                <dt className="text-[0.6rem] tracking-[0.2em] text-bone-faint uppercase rtl:tracking-normal">
                  {fact.label}
                </dt>
                <dd
                  dir={fact.rtlValue && locale === "en" ? "rtl" : undefined}
                  className={cn(
                    "mt-2 text-base font-semibold text-bone",
                    fact.label === t.profile.heightLabel && "text-gold",
                  )}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="rounded-2xl border border-charcoal-line bg-charcoal/40 p-6">
            <p className="text-[0.6rem] tracking-[0.2em] text-bone-faint uppercase rtl:tracking-normal">
              {t.profile.sourcesLabel}
            </p>
            <SourceList
              sources={profile.sources}
              label={t.profile.sourcesLabel}
              className="mt-3"
            />
          </div>

          {/* quick repeat of the hero facts for scanning */}
          <ul className="flex flex-wrap gap-2">
            {heroFacts.map((fact) => (
              <li
                key={fact.id}
                className="rounded-full border border-charcoal-line px-3 py-1.5 text-xs text-bone-muted"
              >
                <span className="text-bone-faint">{pick(fact.label, locale)}: </span>
                <span className="font-semibold text-bone">{pick(fact.value, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}