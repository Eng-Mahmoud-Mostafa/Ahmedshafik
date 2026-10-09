"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { media, type MediaItem } from "@/content/media";
import { isPubliclyRenderable } from "@/content/types";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/cn";
import { nextIndex, prevIndex } from "@/lib/lightbox";

/**
 * Owner-supplied photo gallery with an accessible lightbox.
 *
 * No photographs have been supplied yet, so this renders its designed empty
 * state. The grid and lightbox are still implemented in full: the moment an
 * approved photo is added to `media.ts`, they activate with no other change.
 * Third-party images are never copied into the gallery — press photography is
 * linked at its source in `PressGrid` instead.
 */
export function PhotoGallery({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const photos = media
    .filter(isPubliclyRenderable)
    .filter((item) => item.kind === "photo" && item.src.length > 0);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const closeTo = (index: number | null) => {
    setOpenIndex(null);
    if (index === null) return;
    const trigger = triggerRefs.current[index];
    window.setTimeout(() => trigger?.focus(), 0);
  };

  if (photos.length === 0) {
    return (
      <EmptyState
        title={t.media.emptyTitle}
        body={t.media.emptyBody}
        className="max-w-3xl"
      />
    );
  }

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((item, index) => (
          <li key={item.id}>
            <button
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal/40 text-start transition-colors hover:border-bone-faint"
            >
              <GalleryImage
                item={item}
                locale={locale}
                className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="block p-5">
                <span className="block font-display text-lg font-semibold text-bone">
                  {pick(item.title, locale)}
                </span>
                <span className="mt-1 block text-sm text-bone-muted">
                  {pick(item.caption, locale)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <Lightbox
          items={photos}
          index={openIndex}
          locale={locale}
          onClose={() => closeTo(openIndex)}
          onIndexChange={setOpenIndex}
        />
      ) : null}
    </>
  );
}

/**
 * Renders an image with its intrinsic box reserved when dimensions are known,
 * so the gallery never reflows as pictures load.
 */
function GalleryImage({
  item,
  locale,
  className,
}: {
  item: MediaItem;
  locale: Locale;
  className?: string;
}) {
  const hasDimensions = Boolean(item.width && item.height);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={pick(item.alt, locale)}
      width={hasDimensions ? item.width : undefined}
      height={hasDimensions ? item.height : undefined}
      loading="lazy"
      decoding="async"
      className={className}
      style={hasDimensions ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
    />
  );
}

function Lightbox({
  items,
  index,
  locale,
  onClose,
  onIndexChange,
}: {
  items: MediaItem[];
  index: number;
  locale: Locale;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const t = dictionaryFor(locale);
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange(nextIndex(index, items.length));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange(prevIndex(index, items.length));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, items.length, onClose, onIndexChange]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={pick(item.title, locale)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-4xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full border border-bone-faint/40 px-4 text-sm font-semibold text-bone transition-colors hover:border-bone hover:bg-bone/10"
          >
            {t.media.lightboxClose}
          </button>
        </div>

        <div className="relative flex min-h-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={pick(item.alt, locale)}
            className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-bone">
              {pick(item.title, locale)}
            </p>
            <p className="text-sm text-bone-muted">{pick(item.caption, locale)}</p>
          </div>

          {items.length > 1 ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onIndexChange(prevIndex(index, items.length))}
                aria-label={t.media.lightboxPrevious}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full border border-charcoal-line text-bone transition-colors hover:border-bone hover:bg-bone/10",
                )}
              >
                <span aria-hidden="true" className="rtl:rotate-180">←</span>
              </button>
              <span className="min-w-14 text-center text-xs text-bone-faint">
                {index + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => onIndexChange(nextIndex(index, items.length))}
                aria-label={t.media.lightboxNext}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full border border-charcoal-line text-bone transition-colors hover:border-bone hover:bg-bone/10",
                )}
              >
                <span aria-hidden="true" className="rtl:rotate-180">→</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
