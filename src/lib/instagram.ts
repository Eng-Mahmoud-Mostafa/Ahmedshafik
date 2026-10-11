/**
 * Instagram permalink parsing for the curated gallery.
 *
 * The gallery only ever embeds canonical Instagram post/Reel links that the
 * owner supplies in `src/content/instagram.ts`. Nothing is scraped, no profile
 * is guessed, and anything that is not a genuine instagram.com permalink is
 * rejected rather than embedded. Kept pure and DOM-free so it is asserted in
 * `tests/instagram.test.ts`.
 */

/** Hosts accepted for Instagram permalinks. */
const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

/**
 * First path segments that are Instagram features, not profiles. A single
 * `/p` or `/reel` would otherwise pass the handle pattern.
 */
const RESERVED_PROFILE_SEGMENTS = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "stories",
  "explore",
  "accounts",
  "direct",
  "about",
]);

export type InstagramMediaKind = "post" | "reel";

export interface InstagramPermalink {
  kind: InstagramMediaKind;
  /** The post/Reel shortcode, as Instagram reports it in the URL. */
  shortcode: string;
  /** Canonical permalink, used verbatim as the embed's `data-instgrm-permalink`. */
  url: string;
}

/**
 * Parses a post/Reel URL. Returns `null` for anything that is not an
 * `https://www.instagram.com/{p|reel|reels|tv}/{shortcode}/` link, so a typo or
 * a link to another site can never be embedded.
 */
export function parseInstagramPermalink(raw: string): InstagramPermalink | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (!INSTAGRAM_HOSTS.has(parsed.hostname)) return null;

  const match = /^\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/.exec(parsed.pathname);
  if (!match) return null;

  const [, segment, shortcode] = match;
  const kind: InstagramMediaKind =
    segment === "reel" || segment === "reels" || segment === "tv" ? "reel" : "post";

  return {
    kind,
    shortcode,
    url: `https://www.instagram.com/${kind === "reel" ? "reel" : "p"}/${shortcode}/`,
  };
}

/**
 * Parses a profile URL. Returns the canonical `https://www.instagram.com/{handle}/`
 * form, or `null` when the URL is absent or is not a plain Instagram profile
 * link (so a post URL is never mistaken for the profile).
 */
export function parseInstagramProfile(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (!INSTAGRAM_HOSTS.has(parsed.hostname)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return null;

  const handle = segments[0];
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  if (RESERVED_PROFILE_SEGMENTS.has(handle.toLowerCase())) return null;

  return `https://www.instagram.com/${handle}/`;
}
