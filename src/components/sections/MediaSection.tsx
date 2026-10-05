import type { Locale } from "@/content/types";
import { media } from "@/content/media";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/Primitives";

export function MediaSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const items = media.filter(isPubliclyRenderable);

  return (
    <SectionShell id={SECTION_IDS.media} labelledBy="media-heading">
      <SectionHeading
        id="media-heading"
        eyebrow={t.media.eyebrow}
        title={t.media.title}
      />

      <div className="mt-12">
        {items.length === 0 ? (
          <EmptyState
            title={t.media.emptyTitle}
            body={t.media.emptyBody}
            className="max-w-3xl"
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal/40"
              >
                {item.kind === "photo" && item.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={pick(item.alt, locale)}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 w-full items-center justify-center bg-ink-soft text-xs text-bone-faint">
                    {t.media.slotLabel}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-bone">
                    {pick(item.title, locale)}
                  </h3>
                  <p className="mt-1 text-sm text-bone-muted">
                    {pick(item.caption, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Reserved slots make the intended layout legible while empty. */}
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              aria-hidden="true"
              className="flex aspect-4/3 items-end rounded-2xl border border-dashed border-charcoal-line bg-ink-soft/60 p-4 text-[0.6rem] tracking-[0.2em] text-bone-faint uppercase rtl:tracking-normal"
            >
              {t.media.slotLabel}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}