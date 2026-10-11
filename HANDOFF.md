# Handoff — what is still needed

The application is feature-complete and deployed, but the site is **not
finished**. This file separates what is genuinely missing so nothing is assumed
to be done. See [MAINTENANCE.md](./MAINTENANCE.md) for how to make each change.

## 1. Remaining software defects

**None known.** All previously identified defects were fixed in commit
`5c4e3b8` (contrast below WCAG AA, heading order, a duplicate honeypot field, a
non-localised loading placeholder) and verified locally and in CI.

Known, intentional limitations (not defects):

- The contact rate limiter is **in-memory per server instance**
  (`src/lib/contact-rate-limit.ts`). On serverless infrastructure it resets and
  is not shared across instances. It is a cheap abuse deterrent, not a hard
  guarantee.
- The locale is a **cookie**, so both languages share one URL. There is
  deliberately no `hreflang` and search engines index one canonical page.
- The 3D athlete is a **stylised placeholder**, not a likeness. Anyone reading
  the scene should not be told otherwise until item 2 below is supplied.

## 2. Missing owner-supplied assets

| Asset | Exact input needed | What it blocks |
| --- | --- | --- |
| Athlete model | A `.glb` of Ahmed. Authored **Y-up, facing +Z, in metres** (scale is normalised automatically; feet are grounded at `y = 0`). Hosted at a public URL. | The real 3D athlete. Until supplied, `NEXT_PUBLIC_ATHLETE_MODEL_URL` is unset and the placeholder renders. |
| Photographs | Original files cleared by Ahmed/management, each with English **and** Arabic title, caption and alt text, plus intrinsic `width`/`height`. Place files in `public/media/`. | The photo gallery, which currently shows its designed empty state. |
| Video | Hosted links (YouTube/official publisher) cleared for use, with EN/AR title and caption. | The media grid's video entries. No video is embedded or copied today. |

No third-party image is ever copied; press photography stays a link to the
original publisher in `src/content/press.ts`.

## 3. Missing verified content

| Content | Exact input needed | What it blocks |
| --- | --- | --- |
| Owner statement | A first-person quote/statement approved by Ahmed, in EN and AR, if he wants one published. | A personal voice on the profile. None is invented or drafted on his behalf. |
| Additional career records / honours | The record plus **at least one public source** (or explicit owner approval). Set `verification` and add a `sources` entry. | Any achievement not already on the site. Only the records already backed by a cited source are shown. |
| Corrections | Confirmation of any fact currently marked `unverified` in `src/content/`. | Those drafts are compiled out of the public UI by design and appear nowhere. |

Do not mark a record `verified` without a public source, and do not enter a
`publishedISO` date the publisher does not state.

## 4. Missing service configuration

| Configuration | Exact input needed | What it blocks |
| --- | --- | --- |
| Contact delivery | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` set in Vercel → Project → Settings → Environment Variables (Production). | The contact form. Until all three are present the API answers `503 delivery_not_configured` and the form is disabled. No success is simulated. |
| Sending domain | `CONTACT_FROM_EMAIL` must be a sender/domain **verified in Resend**. | Any real email send — the provider rejects unverified senders. |

These variables are **server-only** (no `NEXT_PUBLIC_` prefix). The visitor's
address is used only as `reply_to`. Configure with a test send before announcing
the form as live.
