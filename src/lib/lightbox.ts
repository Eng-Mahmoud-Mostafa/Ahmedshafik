/**
 * Index maths for the gallery lightbox.
 *
 * Kept pure and separate from React so next/previous wrapping — the part that is
 * easy to get wrong — is asserted in `tests/gallery.test.ts` without a DOM.
 */

/** Coerces any index into `[0, length - 1]`; `0` for an empty list. */
export const clampIndex = (index: number, length: number): number => {
  if (length <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), length - 1);
};

/** The next image, wrapping from the last back to the first. */
export const nextIndex = (index: number, length: number): number => {
  if (length <= 0) return 0;
  return (clampIndex(index, length) + 1) % length;
};

/** The previous image, wrapping from the first back to the last. */
export const prevIndex = (index: number, length: number): number => {
  if (length <= 0) return 0;
  const current = clampIndex(index, length);
  return (current - 1 + length) % length;
};
