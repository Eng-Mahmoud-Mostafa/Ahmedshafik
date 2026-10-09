import type { Locale } from "@/content/types";
import { dictionaryFor } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { PhotoGallery } from "./PhotoGallery";
import { PressGrid } from "./PressGrid";

/**
 * Media section: owner-supplied photos first, then press coverage and official
 * video highlights.
 *
 * The two are deliberately separate. The gallery only ever shows photographs
 * supplied and cleared by the player; press imagery is never copied, and each
 * press card simply links to the original publisher.
 */
export function MediaSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);

  return (
    <SectionShell id={SECTION_IDS.media} labelledBy="media-heading">
      <SectionHeading
        id="media-heading"
        eyebrow={t.media.eyebrow}
        title={t.media.title}
      />

      <div className="mt-14 flex flex-col gap-16">
        <div className="flex flex-col gap-6">
          <h3 className="font-display text-2xl font-semibold text-bone">
            {t.media.galleryLabel}
          </h3>
          <PhotoGallery locale={locale} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-semibold text-bone">
              {t.media.pressLabel}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-bone-muted">
              {t.media.pressIntro}
            </p>
          </div>
          <PressGrid locale={locale} />
        </div>
      </div>
    </SectionShell>
  );
}
