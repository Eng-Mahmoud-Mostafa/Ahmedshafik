"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import {
  instagram,
  publishedInstagramPosts,
  verifiedInstagramProfile,
  type PublishedInstagramPost,
} from "@/content/instagram";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { EmptyState } from "@/components/ui/Primitives";

/**
 * Curated Instagram gallery.
 *
 * Embeds the exact public post/Reel permalinks the owner approves using
 * Instagram's own embed script, loaded lazily once the gallery nears the
 * viewport. It is *curated*, not synchronised: there is no automatic feed,
 * because no Business/Creator connection or credentials have been supplied.
 *
 * Nothing is scraped or downloaded. When a post cannot be rendered, a plain
 * link to Instagram is shown instead of a broken image, and the posts are never
 * pushed into the photo lightbox (Instagram's embed does not support that).
 */

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
/** How long to wait for Instagram to render a post before offering the link. */
const EMBED_TIMEOUT_MS = 9000;

/** Resolved once from the static config; the gallery never mutates it. */
const posts = publishedInstagramPosts(instagram);
const profileUrl = verifiedInstagramProfile(instagram);

type EmbedState = "idle" | "loading" | "ready" | "failed";

interface InstagramEmbedApi {
  Embeds?: { process?: () => void };
}

declare global {
  interface Window {
    instgrm?: InstagramEmbedApi;
  }
}

let embedScriptPromise: Promise<boolean> | null = null;

/** Loads Instagram's official embed script once, and only when needed. */
function loadEmbedScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.instgrm?.Embeds) return Promise.resolve(true);
  if (embedScriptPromise) return embedScriptPromise;

  embedScriptPromise = new Promise<boolean>((resolve) => {
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    const script = document.createElement("script");
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => done(Boolean(window.instgrm?.Embeds));
    script.onerror = () => done(false);
    document.body.appendChild(script);

    window.setTimeout(() => done(Boolean(window.instgrm?.Embeds)), EMBED_TIMEOUT_MS);
  });

  return embedScriptPromise;
}

const escapeHtmlAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * Instagram's documented embed markup. It is injected as inner HTML so React
 * never owns the node: the embed script replaces the `<blockquote>` with an
 * `<iframe>`, and React must not later try to reconcile or remove it.
 */
const embedMarkup = (url: string): string =>
  `<blockquote class="instagram-media" data-instgrm-permalink="${escapeHtmlAttribute(url)}" data-instgrm-version="14"></blockquote>`;

export function InstagramGallery({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedState, setEmbedState] = useState<EmbedState>("idle");

  useEffect(() => {
    if (posts.length === 0) return;
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      setEmbedState("loading");
      void loadEmbedScript().then((ok) => {
        if (cancelled) return;
        if (!ok) {
          setEmbedState("failed");
          return;
        }
        window.instgrm?.Embeds?.process?.();
        setEmbedState("ready");
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(start, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  if (posts.length === 0) {
    return (
      <EmptyState
        title={t.media.instagramEmptyTitle}
        body={t.media.instagramEmptyBody}
        className="max-w-3xl"
      >
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-egypt-red/45 bg-egypt-red/10 px-5 text-sm font-semibold text-egypt-red-soft transition-colors hover:border-egypt-red hover:bg-egypt-red/15"
          >
            {t.media.instagramOpenProfile}
            <span aria-hidden="true" className="rtl:rotate-180">
              ↗
            </span>
          </a>
        ) : null}
      </EmptyState>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-gold underline-offset-4 transition-colors hover:text-bone hover:underline"
        >
          {t.media.instagramOpenProfile}
          <span aria-hidden="true" className="rtl:rotate-180">
            ↗
          </span>
        </a>
      ) : null}

      <ul className="flex flex-wrap justify-center gap-6">
        {posts.map((post) => (
          <li key={post.id} className="w-full min-w-0 max-w-[24rem]">
            <InstagramEmbedCard post={post} locale={locale} embedState={embedState} />
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-bone-faint">{t.media.instagramNote}</p>
    </div>
  );
}

function InstagramEmbedCard({
  post,
  locale,
  embedState,
}: {
  post: PublishedInstagramPost;
  locale: Locale;
  embedState: EmbedState;
}) {
  const t = dictionaryFor(locale);
  const frameRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Status is derived from the gallery's script state plus what the observer
  // below reports, so no state is set synchronously inside the effect.
  const status: "loading" | "ready" | "unavailable" =
    embedState === "failed" || timedOut
      ? "unavailable"
      : embedState === "ready" && rendered
        ? "ready"
        : "loading";

  useEffect(() => {
    if (embedState !== "ready") return;

    const frame = frameRef.current;
    if (!frame) return;

    const hasEmbed = () => Boolean(frame.querySelector("iframe"));
    if (hasEmbed()) {
      const id = window.setTimeout(() => setRendered(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new MutationObserver(() => {
      if (hasEmbed()) {
        setRendered(true);
        observer.disconnect();
      }
    });
    observer.observe(frame, { childList: true, subtree: true });

    const timeout = window.setTimeout(() => {
      if (!hasEmbed()) setTimedOut(true);
      observer.disconnect();
    }, EMBED_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [embedState]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal-line bg-charcoal/40">
      {/*
        Instagram's embed iframe carries a hard `min-width: 326px`, so the embed
        fills the card edge to edge (no side padding) and the wrapper clips any
        residual overflow on very narrow phones instead of scrolling the page.
      */}
      <div className="relative min-h-[28rem] w-full overflow-hidden bg-ink-soft">
        <div
          ref={frameRef}
          className="flex w-full justify-center"
          dangerouslySetInnerHTML={{ __html: embedMarkup(post.url) }}
        />

        {status === "loading" ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-soft/90"
          >
            <span className="inline-block size-8 animate-spin rounded-full border-2 border-charcoal-line border-t-egypt-red" />
            <span className="text-xs text-bone-faint">{t.media.instagramLoading}</span>
          </div>
        ) : null}

        {status === "unavailable" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-soft/95 px-6 text-center">
            <p className="text-sm font-semibold text-bone">{t.media.instagramUnavailable}</p>
            <p className="text-xs text-bone-muted">{t.media.instagramUnavailableHint}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {post.caption ? (
          <p className="text-sm leading-relaxed text-bone-muted">{pick(post.caption, locale)}</p>
        ) : null}
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-auto inline-flex w-fit items-center gap-2 text-sm font-semibold text-gold underline-offset-4 transition-colors hover:text-bone hover:underline"
        >
          {t.media.instagramOpenPost}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          >
            ↗
          </span>
        </a>
      </div>
    </div>
  );
}
