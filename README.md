# Ahmed Said Shafik — Portfolio (Stage One)

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
npm test                     # node --test (content invariants)
npm run build                # next build
npm start                    # serve the production build
```

Requires Node.js 20.9+ (developed on 24.x).

## Content model

All site copy lives in typed files under `src/content/`:

| File                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `types.ts`          | Shared types + `isPubliclyRenderable()` gate     |
| `profile.ts`        | Identity, biography, competition records, age calc |
| `career.ts`         | Career timeline entries                         |
| `achievements.ts`   | Achievement records                             |
| `media.ts`          | Gallery items (empty in stage one)              |
| `contact.ts`        | Inquiry categories + delivery configuration     |

**Editorial rule.** Every factual record carries a `verification` status and a
`sources` list. Only `verified` and `owner-approved` records are rendered;
`unverified` drafts stay in the data file but are filtered out of the UI. Jersey
number 18 is labelled with the competition it belongs to (2025 FIVB Men's World
Championship), never as a career-long number.

Source of truth for the stage-one facts:
<https://en.volleyballworld.com/volleyball/competitions/men-world-championship/players/143887>

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
placeholder athlete in a red kit, a volleyball, a dark marked court, stadium
lighting with restrained red rim light, three translucent thought clouds, and a
gold trophy and medal.

- `src/components/scene/AthleteScene.tsx` — canvas, lighting, assembly.
- `src/components/scene/PlaceholderAthlete.tsx` — the temporary athlete.
- `src/components/scene/AthleteModel.tsx` — **replaceable** model slot.
- `src/components/scene/SceneStage.tsx` — WebGL detection, loading and fallback.
- `src/components/scene/SceneInteractions.tsx` — the "Beyond the Court" panel and
  the accessible HTML equivalents of every scene hotspot.

**The 3D athlete is a stylised placeholder, not a likeness of Ahmed.**

### Adding a real model later

Set `NEXT_PUBLIC_ATHLETE_MODEL_URL` to an absolute GLB URL. With it set, the GLB
replaces the placeholder; with it unset, the placeholder renders and **no
request for a model file is made**, so a missing asset can never 404. A model
that fails to load falls back to the placeholder rather than a blank canvas.

### Scene interactions

| Hotspot            | Result                                     |
| ------------------ | ------------------------------------------ |
| My Journey         | scrolls to Career                          |
| Player Profile     | scrolls to Profile                         |
| Beyond the Court   | opens a panel with an empty state           |
| Trophy             | scrolls to Achievements                    |
| Medal              | scrolls to the 2025 international entry    |

All five are mirrored as real HTML buttons under the canvas, so the scene is
fully usable without WebGL, with a keyboard, and with a screen reader.

The trophy and medal are decorative set dressing and are labelled as such —
they do not represent awards.

### Accessibility and performance

- `prefers-reduced-motion` disables idle movement (`frameloop="demand"`) and
  all CSS transitions.
- Mobile / narrow viewports get lower DPR, no shadows, no contact shadows and
  simpler geometry.
- Static loading placeholder and a designed WebGL fallback.
- The canvas is `aria-hidden`; its content is available as HTML.

## Contact form

`src/components/sections/ContactForm.tsx` validates name, email, category and
message client-side. Submission is **unavailable until an email service is
configured** — the button is disabled and the reason is stated. No success state
is ever simulated.

`src/app/api/contact/route.ts` is the endpoint slot for stage two; it answers
`503 delivery_not_configured` today. `resolveContactConfig()` in
`src/content/contact.ts` reads `CONTACT_PROVIDER`, `CONTACT_API_KEY` and
`CONTACT_TO_EMAIL` **server-side only**. No credential is ever exposed to the
browser, and nothing belongs in a `NEXT_PUBLIC_` variable.

## Environment variables

See `.env.example`. All are optional; the app runs without any of them.

## Still needed for the next stage

- A GLB model of Ahmed (or approval to keep the placeholder).
- Reference photographs and video links for the gallery.
- Verified club history, statistics and achievements.
- A contact email service plus the recipient address.