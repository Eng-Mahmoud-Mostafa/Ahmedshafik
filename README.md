# Ahmed Said Shafik — Portfolio

Cinematic athlete portfolio for **Ahmed Said Shafik — أحمد سعيد شفيق**, Egyptian
international outside hitter. Next.js App Router + TypeScript + Tailwind CSS +
React Three Fiber, deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; the app runs with no env at all
npm run dev                  # http://localhost:3000
```

Production checks:

```bash
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm test                     # node --test (content + composition invariants)
npm run build                # next build
npm start                    # serve the production build
```

Requires Node.js 20.9+ (developed on 24.x).

## Content model

All site copy lives in typed files under `src/content/`:

| File                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `types.ts`          | Shared types + `isPubliclyRenderable()` gate     |
| `sources.ts`        | Every public source, defined once, with publication/checked dates |
| `profile.ts`        | Identity, biography, competition records, age calc |
| `career.ts`         | Career timeline entries (club + national), newest first |
| `achievements.ts`   | Verified archive + `groupAchievements()` / `archiveGroups()` |
| `press.ts`          | Press coverage and official video highlight links |
| `beyond.ts`         | Beyond-the-court entries (empty until approved)  |
| `media.ts`          | Owner-supplied gallery items (empty until assets are supplied) |
| `contact.ts`        | Inquiry categories + delivery configuration     |
| `panels.ts`         | Read-only selectors the 3D panels render from    |

**Editorial rule.** Every factual record carries a `verification` status and a
`sources` list. Only `verified` and `owner-approved` records are rendered;
`unverified` drafts stay in the data file but are filtered out of the UI. Each
`SourceRef` records a `checkedISO` date, and a `publishedISO` date when the
publisher states one. Jersey number 18 is labelled with the competition it
belongs to (2025 FIVB Men's World Championship), never as a career-long number.

**Appearance vs honour.** Every achievement record carries a `recordType` of
`appearance` | `title` | `medal` | `award`. A squad selection is an
`appearance` and can never render as a win. `groupAchievements()` splits records
by type for the scene panels; `archiveGroups()` partitions the public archive
into the four groups the page shows — club titles, national-team results,
individual awards and international appearances — with no record in two groups.
A group with nothing verified states that plainly instead of rendering an empty
list, and a test asserts the partition drops nothing and double-counts nothing.

`beyondEntries` is deliberately an empty array. That is the correct published
state, not a placeholder: the panel says so in both languages.

Source of truth for the verified facts:
<https://en.volleyballworld.com/volleyball/competitions/men-world-championship/players/143887>

### What stage three publishes

- **Biography** (EN + AR) built only from sourced facts: born 7 December 1994,
  190 cm, Egyptian outside hitter; Al Ahly SC from 2015; the 2024/25 season at
  Al Swehly (Asswehly) in Libya; and Al-Ula (Saudi Arabia) from the 2025/26
  season, confirmed by his management.
- **Career timeline** with club and national-team filters, newest first.
- **Achievements archive** in four groups. Club titles: the 2025 African Club
  Championship with Al Swehly, plus the 2024/25 Libyan league and cup. National
  results: African champions 2015 and 2023, silver 2017 and at the 2013 Islamic
  Solidarity Games. Individual awards: 2025 African Club Championship MVP and
  2023 Best Outside Hitter. International appearances: World Championships,
  World Cup, World League, Challenger Cup and more.
- **Press & highlights**: match reports and the official Iran–Egypt highlight
  video, each linked to its original publisher. No article text or third-party
  image is copied.

**Unpublished gaps** (documented in the data files, never rendered):

- A verified sit-down **interview** has not been found, so none is published; the
  `interview` press kind exists for when one is.

## Internationalisation

- Interface strings: `src/i18n/dictionary.ts` — English is the source of truth
  and Arabic is typed against it, so a missing Arabic key fails the build.
- Locale is stored in the `ash_locale` cookie and read on the server
  (`src/i18n/server.ts`), so the first paint already has the right language and
  `dir="rtl"`.
- Switching language updates the cookie, sets `lang`/`dir`, and calls
  `router.refresh()` so server and client render the same language.

## 3D scene

The hero scene is built with React Three Fiber and Drei. It contains a stylised
placeholder athlete in a red kit, a volleyball, a marked court with a background
net, stadium lighting with restrained red rim light and contact shadows, three
translucent thought clouds above the athlete, and a gold trophy and medal above
the hands.

- `src/components/scene/AthleteScene.tsx` — canvas, lighting, assembly.
- `src/components/scene/PlaceholderAthlete.tsx` — the temporary athlete.
- `src/components/scene/AthleteModel.tsx` — **replaceable** model slot.
- `src/components/scene/SceneStage.tsx` — WebGL detection, loading, fallback,
  offscreen pause.
- `src/components/scene/SceneDialog.tsx` — panel chrome: header, close button,
  scrolling body, footer, focus trap and restoration.
- `src/components/scene/ScenePanels.tsx` — the five panel bodies.
- `src/components/scene/SceneInteractions.tsx` — accessible HTML equivalents of
  every scene hotspot.
- `src/components/scene/config.ts` — set-piece positions, colours, bounds.
- `src/components/scene/framing.ts` — camera solve for the current aspect.

**The 3D athlete is a stylised placeholder, not a likeness of Ahmed.**

### Composition is asserted, not eyeballed

`tests/composition.test.ts` projects every scene feature through the same camera
solve the app uses and fails the build if, at aspect ratios 4/5, 3/4, 1 and 16/9,
any feature leaves the frame, the clouds overlap the head, a cloud runs off the
side, a set piece sinks below the hands, or the ball escapes the bottom edge.
Cloud separation is measured against the clouds' own projected width rather than
a fixed percentage, so the check stays meaningful on wide aspects.

`SCENE_CONTENT_BOUNDS` in `framing.ts` is the declared extent the solve fits. Do
not remove it — it is the contract the tests assert against.

### Adding a real model later

Set `NEXT_PUBLIC_ATHLETE_MODEL_URL` to an absolute GLB URL. With it set, the GLB
replaces the placeholder; with it unset, the placeholder renders and **no
request for a model file is made**, so a missing asset can never 404. A model
that fails to load falls back to the placeholder rather than a blank canvas. A
supplied model is normalised to roughly 1.83 m standing on y = 0 so it composes
with the set pieces.

### Scene interactions

| Hotspot            | Panel                   | Footer link      |
| ------------------ | ----------------------- | ---------------- |
| My Journey         | verified career timeline | `#career`        |
| Player Profile     | confirmed facts + facts strip | `#profile`  |
| Beyond the Court   | empty state             | `#beyond`        |
| Trophy             | Club Achievements       | `#achievements`  |
| Medal              | International Career    | `#career`        |

Every hotspot opens its own panel, and `useExclusivePanel` guarantees only one is
open at a time. Each panel's footer link closes the panel, scrolls to the full
section and moves focus to it.

All five are mirrored as real HTML buttons under the canvas, so the scene is
fully usable without WebGL, with a keyboard, and with a screen reader. If WebGL
cannot start, a designed fallback explains why and the five buttons — with all
their content — still work.

The trophy and medal are decorative set dressing and are labelled as such in
both languages. The panels they open now render the verified records — the
trophy panel lists the club titles and the medal panel the national results,
individual awards and international appearances — each in its own labelled
group so an appearance is never read as a win.

### Entrance and motion

The entrance runs court + lighting → athlete → clouds → trophy/medal, driven by
wall-clock `setTimeout` in `entrance.ts` / `useEntranceSequence.ts` — the pure
module holds the timing and visibility maths so the tests never import React.
`prefers-reduced-motion` resolves the whole sequence to `settled` immediately.
Pointer depth on desktop is a damped 0.13-unit parallax, disabled for reduced
motion, low-power viewports and paused frames. The scene pauses rendering when
it leaves the viewport (`frameloop="never"` via IntersectionObserver).

### Accessibility and performance

- `prefers-reduced-motion` disables idle movement (`frameloop="demand"`) and
  all CSS transitions.
- Mobile / narrow viewports get lower DPR, no shadows, no contact shadows and
  simpler geometry.
- Static loading placeholder and a designed WebGL fallback.
- The canvas is `aria-hidden`; its content is available as HTML.
- Panels trap Tab, close on Escape, and restore focus to the control that opened
  them. The close button is a 44px target in both languages.

## Contact form

`src/components/sections/ContactForm.tsx` validates name, email, category and
message client-side. Submission is **unavailable until an email service is
configured** — the button is disabled and the reason is stated. No success state
is ever simulated.

`src/app/api/contact/route.ts` answers `503 delivery_not_configured` until the
mail service is set up. `resolveContactConfig()` in `src/content/contact.ts`
reads **`RESEND_API_KEY`**, **`CONTACT_TO_EMAIL`** and `CONTACT_FROM_EMAIL`
server-side only, and resolves to `null` unless all three are present. No
credential ever reaches the browser, and none of these may use a `NEXT_PUBLIC_`
prefix.

Abuse controls are layered and stateless: a honeypot field, a short-lived HMAC
token minted per render (`src/lib/contact-token.ts`, min age 2.5 s / max age 2h)
and an in-memory per-IP limiter (`src/lib/contact-rate-limit.ts`). The route
reports success only after the provider returns 2xx; it never claims inbox
delivery, and provider errors are surfaced as a generic failure with no upstream
detail leaked to the visitor. The visitor's address is used only as `reply_to`,
never in the subject or headers.

## SEO, metadata and deployment

- A cookie-based locale means one URL serves both languages, so the site
  advertises a single canonical (`https://ahmedshafik.vercel.app`) and no
  `hreflang` alternates. `Cookie: ash_locale` selects English or Arabic on the
  same URL.
- `src/app/robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx` and
  `apple-icon.tsx` generate the crawler and social assets.
- Only the Vercel **production** deployment is indexable. Preview and
  development builds emit `robots: noindex, nofollow` (see
  `src/lib/deployment.ts` and the test in `tests/contact.test.ts`), so previews
  can never enter a search index.
- The canonical origin lives in `src/lib/structured-data.ts`
  (`PRODUCTION_ORIGIN`). Change it there if the domain changes.

## Environment variables

See `.env.example`. All are optional; the app runs without any of them.

See [MAINTENANCE.md](./MAINTENANCE.md) for the full editing and operations guide.

## Still needed from the owner

The software is complete; these inputs are not:

- A GLB model of Ahmed (or approval to keep the stylised placeholder) — see
  [MAINTENANCE.md](./MAINTENANCE.md) §7 for the required orientation and scale.
- Photographs and video, cleared for use, for the gallery — the grid and
  accessible lightbox are built and activate as soon as `media.ts` is populated
  with `owner-approved` items that carry intrinsic `width`/`height`.
- A contact email service (Resend API key + verified sender) plus the recipient
  address, set as `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL`.

[HANDOFF.md](./HANDOFF.md) lists each outstanding item, the exact input required
and the feature it blocks.