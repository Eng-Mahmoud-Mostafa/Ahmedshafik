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
  year?: number;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * Stage one ships no invented media.
 *
 * The gallery renders its designed empty state until player-approved photos or
 * video links are added here with a `verification` of `owner-approved`.
 */
export const media: MediaItem[] = [];