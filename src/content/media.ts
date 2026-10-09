import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";

export type MediaKind = "photo" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: LocalizedText;
  caption: LocalizedText;
  /** Public URL for the asset. Empty until real media is supplied. */
  src: string;
  /** Video links (e.g. a hosted match clip) go here. */
  href: string;
  alt: LocalizedText;
  /**
   * Intrinsic pixel dimensions, used to reserve the image's box before it loads
   * so the page never reflows. Supplied alongside any real photograph.
   */
  width?: number;
  height?: number;
  year?: number;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * Owner-supplied photographs and video.
 *
 * Still intentionally empty: nothing has been supplied by the player or his
 * management, and no third-party image is copied here. The gallery renders its
 * designed empty state until real, owned assets are added with a `verification`
 * of `owner-approved`. Press coverage and official video links live in
 * `press.ts` instead, where they are linked to their original source.
 */
export const media: MediaItem[] = [];
