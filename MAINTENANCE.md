# Maintenance guide

Practical guide for running, editing and shipping the Ahmed Said Shafik
portfolio. It documents the implementation as it exists — nothing here is
aspirational. For the conceptual overview see [README.md](./README.md).

- **Stack:** Next.js App Router (16.3.8) + TypeScript + Tailwind CSS v4 +
  React Three Fiber, deployed on Vercel.
- **Languages:** English (default) and Arabic, chosen by a `ash_locale` cookie.

---

## 1. Install, run and check

Requirements: Node.js **20.9+** (developed and tested on 24.x) and npm.

```bash
npm install          # or: npm ci  (reproducible, uses package-lock.json)
npm run dev          # http://localhost:3000
```

The app runs with **no environment variables at all**. The 3D scene and every
section work; only the contact form stays visibly unavailable (see §8).

Checks that must pass before a change is shipped:

| Command             | What it does                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run typecheck` | `tsc --noEmit`                                            |
| `npm run lint`      | ESLint (flat config, `eslint-config-next`)                |
| `npm test`          | `node --test "tests/**/*.test.ts"` — 9 suites             |
| `npm run build`     | Production build (`next build`)                            |
| `npm start`         | Serves the production build on port 3000                  |

The same four checks run in CI on every push and pull request
(`.github/workflows/ci.yml`). Node 24 is used there to match development.

---

## 2. Where everything lives

| Path                     | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------ |
| `src/app/`               | Routes, layout, metadata + generated icons/OG/robots/sitemap |
| `src/components/`        | Page sections, nav, footer and the 3D scene                  |
| `src/content/`           | **All editable content** (typed, bilingual)                  |
| `src/i18n/dictionary.ts` | All interface strings (EN + AR)                              |
| `src/lib/`               | Shared helpers (contact, tokens, SEO, media queries)         |
| `tests/`                 | Node test runner suites (content, composition, contact, …)   |

There is no `public/` directory: the favicon and app icons are generated from
`src/app/icon.svg` and `src/app/apple-icon.tsx`.

---

## 3. Editing bilingual content

Every human-readable value is a `LocalizedText`, i.e. `{ en: "…", ar: "…" }`.
Never leave a language blank — TypeScript will reject a `LocalizedText` missing
either key, so `npm run typecheck` catches it.

- **Facts, career, achievements, press, media:** edit the matching file in
  `src/content/`.
- **Interface strings** (buttons, labels, headings, empty states): edit
  `src/i18n/dictionary.ts`. English is the source of truth and the `ar` object is
  typed against it, so a missing Arabic key fails the build.
- **Sources:** define each public source once in `src/content/sources.ts` and
  reference it from records, rather than pasting URLs inline.

After editing, run `npm test` and `npm run typecheck`.

---

## 4. How verification status controls public content

Every factual record carries `verification` (see `src/content/types.ts`):

| Status           | Meaning                                              | Rendered? |
| ---------------- | ---------------------------------------------------- | --------- |
| `verified`       | Confirmed against a cited public source              | Yes       |
| `owner-approved` | Supplied and cleared by the player or his management | Yes       |
| `unverified`     | Drafted, not confirmed                               | **No**    |

`isPubliclyRenderable()` filters the public UI, and a test asserts that
unverified drafts never appear. To publish a new fact: set the correct status
**and** add at least one `sources` entry with a `checkedISO` date. Do not mark
something `verified` unless a public source backs it, and do not guess a
`publishedISO`.

---

## 5. Adding career records and achievements

### Career timeline — `src/content/career.ts`

Each `CareerEntry` needs: `id` (unique), `period` (sort key, newest first),
`periodLabel`, `title`, `organisation`, `detail`, `category`
(`club` | `national` | `education`), optional `highlight`, plus
`verification` and `sources`.

### Achievement archive — `src/content/achievements.ts`

Each `AchievementEntry` needs: `id` (unique), `title`, `context`, `year`,
`category` (`club` | `international` | `individual`), `recordType`, plus
`verification` and `sources`.

**`recordType` is mandatory and is the guard against double-counting:**

- `appearance` — took part / selected for a competition. **Never a win.**
- `title` — an actual championship title.
- `medal` — a medal at a competition.
- `award` — an individual award.

`archiveGroups()` partitions the public archive into exactly four groups (club
titles, national-team results, individual awards, international appearances) with
no record in two groups, and `tests/content.test.ts` asserts the partition drops
nothing and double-counts nothing. Keep this invariant when adding records: a
squad selection is an `appearance`, and a title must be supported by a roster,
Dream Team listing or match report.

Run `npm test` after adding entries — the archive/grouping tests will catch a
mis-typed record.

---

## 6. Adding photographs, video and Instagram

### Owner photographs and video

Owner-supplied media lives in `src/content/media.ts` (the `media` array), which
is **intentionally empty** until real, cleared assets exist.

For a photograph:

```ts
{
  id: "match-2025-01",
  kind: "photo",
  title: { en: "…", ar: "…" },
  caption: { en: "…", ar: "…" },
  src: "/media/match-2025-01.jpg",   // add the file to public/media/
  alt: { en: "…", ar: "…" },
  width: 1600,                        // intrinsic pixels — prevents layout shift
  height: 1067,
  verification: "owner-approved",
  sources: [],
}
```

For video, set `kind: "video"` and put the hosted link in `href`. The gallery
renders its designed empty state until at least one item has `verification` of
`owner-approved`; the moment one is added the grid and accessible lightbox
activate with no code change.

**Do not copy third-party images.** Press photography and video stay as links to
the original publisher in `src/content/press.ts`, never as downloaded files.

### Instagram gallery — `src/content/instagram.ts`

The media section also renders a curated Instagram gallery. It is **curated, not
automatically synchronised**: it embeds the exact public permalinks you enter and
nothing else.

```ts
export const instagram: InstagramConfig = {
  profileUrl: "",              // verified profile, e.g. "https://www.instagram.com/<handle>/"
  handle: "",                  // display handle without the @
  posts: [
    // {
    //   id: "match-2025-highlights",
    //   url: "https://www.instagram.com/reel/<shortcode>/", // or /p/<shortcode>/
    //   caption: { en: "…", ar: "…" },                    // optional
    //   verification: "owner-approved",
    //   sources: [],
    // },
  ],
};
```

- Only `https://www.instagram.com/{p|reel}/{shortcode}/` links are embedded;
  anything else is skipped rather than embedded (`src/lib/instagram.ts`), and only
  `verified` / `owner-approved` posts are rendered.
- Instagram's own embed script loads **lazily**, only when the gallery nears the
  viewport. Each card reserves its space, shows a loading state, and offers a
  plain link to Instagram if the post cannot be shown.
- **No environment variable is needed** for curated embeds. An automatically
  updating feed (the Instagram Graph API with a Business/Creator account and a
  server-side token) is **not** implemented; if added later, keep the token
  server-side and never use a `NEXT_PUBLIC_` prefix.
- Do not enter a post URL you have not confirmed belongs to Ahmed, and do not
  guess the handle. The gallery embeds nothing until both are supplied.

---

## 7. Replacing the placeholder athlete with Ahmed's GLB

The scene currently renders a **stylised placeholder** (`PlaceholderAthlete.tsx`).
It is not a likeness and must not be described as one.

To use a real model, set the build-time variable:

```
NEXT_PUBLIC_ATHLETE_MODEL_URL=https://…/ahmed-shafik.glb
```

Where to set it: Vercel → Project → Settings → Environment Variables
(Production), and `.env.local` for local work. Because it is a `NEXT_PUBLIC_`
value it is inlined at build time, so a **redeploy is required** after changing
it. When it is unset, no request for a model file is made at all.

The loader (`src/components/scene/AthleteModel.tsx`) normalises whatever you
supply, so the GLB does not need to be authored to scene units:

- **Scale:** the model is uniformly scaled so its height is **1.83 m**.
- **Grounding:** it is centred on X/Z and its lowest point sits on `y = 0` (the
  court), so it neither floats nor sinks.
- **Orientation:** the camera looks from **+Z** (a slight three-quarter view
  from front-right). Author the model **Y-up and facing +Z**; the loader does not
  rotate it.
- **Shadows:** every mesh is set to cast and receive shadows.
- **Anchors:** the trophy, medal, ball and thought clouds are positioned by
  `SCENE_ANCHORS` and `CLOUD_ANCHORS` in
  `src/components/scene/config.ts`. If the new model is proportioned differently,
  adjust those values — the hand anchors (`leftHand` / `rightHand`) position the
  achievement light trails.
- **Framing:** `src/components/scene/framing.ts` fits the declared
  `SCENE_CONTENT_BOUNDS` to the canvas aspect. If the model needs more room,
  widen those bounds rather than moving the camera by hand; `tests/composition.test.ts`
  asserts every feature stays in frame at 4/5, 3/4, 1 and 16/9.

**Fallback is automatic:** if the URL is missing, the file 404s, or parsing
throws, an error boundary (`ModelErrorBoundary`) and a Suspense fallback render
the placeholder instead of a blank canvas. The build never fetches a model.

---

## 8. Contact delivery configuration

The contact form posts to `src/app/api/contact/route.ts` and sends through
[Resend](https://resend.com) at `https://api.resend.com/emails` (a direct HTTP
POST — no SDK).

Required variables (server-side only):

| Variable             | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key used to send the inquiry                    |
| `CONTACT_TO_EMAIL`   | Inbox that receives inquiries (server-controlled)          |
| `CONTACT_FROM_EMAIL` | Verified Resend sender, e.g. `Portfolio <contact@example.com>` |

`resolveContactCredentials()` returns `null` unless **all three** are set.

- **Where configured:** Vercel → Project → Settings → Environment Variables, and
  `.env.local` locally (copy `.env.example`). Never commit a real `.env`.
- **When any is missing:** the API answers `503 delivery_not_configured`, the
  submit button is disabled, and the form states plainly that it cannot send.
  No success is ever simulated.
- **Security:** these must not use a `NEXT_PUBLIC_` prefix, so they never reach
  the browser. Abuse controls are a honeypot plus a short-lived HMAC token
  (`src/lib/contact-token.ts`) and an in-memory per-IP limiter
  (`src/lib/contact-rate-limit.ts`). The visitor's email is used only as
  `reply_to`.
- `CONTACT_FROM_EMAIL` must be a domain/sender verified in Resend, or the
  provider will reject the send.

---

## 9. How GitHub changes reach Vercel

The Vercel project (`hacker-255s-projects/ahmedshafik`) is connected to
`Eng-Mahmoud-Mostafa/Ahmedshafik` through Git integration. **No manual deploy is
needed:**

1. Push to `main` → Vercel builds and promotes a **Production** deployment.
2. Push to any other branch / open a PR → Vercel builds a **Preview** deployment.

Only the Production deployment is indexable; preview and development builds emit
`robots: noindex, nofollow` (`src/lib/deployment.ts`).

GitHub Actions CI (`verify` job) runs the same typecheck/lint/test/build on the
push or PR and does **not** deploy — Vercel owns deployment.

---

## 10. Inspecting a failed deployment and rolling back

**If CI fails (GitHub):** open the Actions tab → the failing `CI` run → the
`verify` job, and read the failing step. Reproduce locally with:

```bash
npm ci
npm run typecheck && npm run lint && npm test && npm run build
```

**If a Vercel build or the live site fails:** open the Vercel project →
**Deployments** → select the failed deployment → **Building** logs. The most
common causes are a failed `npm run build` (same checks as above) or a missing
environment variable.

**To roll back:** in Vercel → Deployments, find the last known-good Production
deployment → **⋯ → Promote to Production** (or **Redeploy**). Alternatively
revert the offending commit on `main` and push; Vercel will build the revert.
Do not force-push `main`.

**Metadata spot-check after a production deploy:**

- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`
- `<link rel="canonical">` and the OG/Twitter tags in the page source
- The canonical origin in `src/lib/structured-data.ts` (`PRODUCTION_ORIGIN`)
  should match the live domain.

---

## 11. Environment variable reference

| Variable                        | Scope             | Required | Notes                                   |
| ------------------------------- | ----------------- | -------- | --------------------------------------- |
| `NEXT_PUBLIC_ATHLETE_MODEL_URL` | Client (inlined)  | No       | GLB URL; unset → placeholder, no fetch  |
| `RESEND_API_KEY`                | Server only       | No       | Contact form unavailable until set      |
| `CONTACT_TO_EMAIL`              | Server only       | No       | Inquiry recipient                       |
| `CONTACT_FROM_EMAIL`            | Server only       | No       | Verified Resend sender                  |

The Instagram gallery is a curated embed and needs **no** environment variable.
An automatically synchronised feed would require a server-side token and is not
implemented.

---

## 12. Outstanding owner inputs

The site is complete software, but it is **not finished** until these are
supplied. See README → *Still needed from the owner* for the same list:

- A GLB model of Ahmed (or approval to keep the stylised placeholder).
- Photographs and video, cleared for use, for the gallery.
- The **verified** Instagram profile URL and the approved post/Reel links for the
  Instagram gallery (`src/content/instagram.ts`).
- A contact email service (Resend key) and the recipient address.
