import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";
import { isPubliclyRenderable } from "./types.ts";
import {
  parseInstagramPermalink,
  parseInstagramProfile,
  type InstagramMediaKind,
} from "../lib/instagram.ts";

export interface InstagramPostConfig {
  id: string;
  /**
   * Canonical Instagram post or Reel URL supplied by the owner, e.g.
   * `https://www.instagram.com/p/{shortcode}/` or `.../reel/{shortcode}/`.
   * It is validated before embedding; anything else is skipped.
   */
  url: string;
  /** Optional editorial caption shown under the embed, in both languages. */
  caption?: LocalizedText;
  verification: VerificationStatus;
  sources: SourceRef[];
}

export interface InstagramConfig {
  /**
   * Verified Instagram profile URL. Intentionally empty: the account has not
   * been confirmed by the owner, and guessing a handle is not acceptable.
   */
  profileUrl: string;
  /** Display handle without the leading `@`. Empty until confirmed. */
  handle: string;
  /** Curated posts/Reels. Empty until the owner supplies specific links. */
  posts: InstagramPostConfig[];
}

/**
 * Curated Instagram gallery configuration.
 *
 * There is no automatic synchronisation here by design: it embeds the exact
 * public permalinks the owner approves, using Instagram's own embed, and only
 * when a verified profile and at least one post exist. The account type,
 * permissions and credentials required for an automatically updating feed have
 * not been supplied, so nothing pretends to be live.
 */
export const instagram: InstagramConfig = {
  profileUrl: "",
  handle: "",
  posts: [],
};

export interface PublishedInstagramPost {
  id: string;
  kind: InstagramMediaKind;
  /** Canonical permalink, safe to embed and to link to. */
  url: string;
  caption?: LocalizedText;
}

/**
 * The posts that are actually renderable: approved records whose URL resolves
 * to a genuine Instagram permalink, in configuration order.
 */
export function publishedInstagramPosts(config: InstagramConfig): PublishedInstagramPost[] {
  const resolved: PublishedInstagramPost[] = [];

  for (const post of config.posts) {
    if (!isPubliclyRenderable(post)) continue;
    const parsed = parseInstagramPermalink(post.url);
    if (!parsed) continue;
    resolved.push({
      id: post.id,
      kind: parsed.kind,
      url: parsed.url,
      caption: post.caption,
    });
  }

  return resolved;
}

/** The verified profile URL, or `null` when it is absent or not an Instagram link. */
export function verifiedInstagramProfile(config: InstagramConfig): string | null {
  return parseInstagramProfile(config.profileUrl);
}
