import type { SourceRef } from "./types.ts";

/**
 * Every public source used across the site, defined once.
 *
 * A record cites these constants rather than repeating a URL, so a fact's
 * provenance is consistent wherever it appears. Every entry records the date it
 * was last checked (`checkedISO`); `publishedISO` is set only when the publisher
 * states a publication date, and is left undefined rather than guessed.
 *
 * Verification policy: official bodies (FIVB / Volleyball World) and event
 * articles are preferred. Wikipedia and Volleybox are used for squad lists and
 * career spans, and are labelled as such in the record that cites them.
 */

/** All sources below were checked against their live pages on this date. */
const CHECKED = "2026-10-09";

/** Official FIVB Men's World Championship 2025 player profile and statistics. */
export const VOLLEYBALL_WORLD_PLAYER_SOURCE: SourceRef = {
  label: "Volleyball World — 2025 Men's World Championship player profile",
  url: "https://en.volleyballworld.com/volleyball/competitions/men-world-championship/players/143887",
  checkedISO: CHECKED,
};

/** Official match report: Egypt beat Iran 3-1 in their 2025 opener. */
export const VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE: SourceRef = {
  label: "Volleyball World — “Egypt produce sensational win over Iran”",
  url: "https://en.volleyballworld.com/volleyball/competitions/men-world-championship/news/egypt-produce-sensational-win-over-iran-at-men-s-volleyball-world-championship",
  publishedISO: "2025-09-14",
  checkedISO: CHECKED,
};

/** Official match highlights video for Iran vs Egypt (2025 World Championship). */
export const VOLLEYBALL_WORLD_EGYPT_IRAN_VIDEO_SOURCE: SourceRef = {
  label: "Volleyball World — Iran vs Egypt match highlights (video)",
  url: "https://en.volleyballworld.com/volleyball/competitions/men-world-championship/videos/iran-vs-egypt-vbw-men-s-world-championship-match-highlights",
  publishedISO: "2025-09-14",
  checkedISO: CHECKED,
};

/** Official report: Al Swehly win the 2025 African Club Championship; Shafik MVP. */
export const VOLLEYBALL_WORLD_SWEHLY_SOURCE: SourceRef = {
  label: "Volleyball World — “Swehly emerge as first Libyan team to conquer African crown”",
  url: "https://en.volleyballworld.com/volleyball/competitions/club-world-championship-men/news/swehly-emerge-as-first-libyan-team-to-conquer-african-crown-and-qualify-for-club-world-championships",
  publishedISO: "2025-04-30",
  checkedISO: CHECKED,
};

/** Official report: Egypt win the 2023 Men's African Nations Championship. */
export const VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE: SourceRef = {
  label: "Volleyball World — “Egypt celebrate African title at home”",
  url: "https://en.volleyballworld.com/volleyball/competitions/volleyball-olympic-qualifying-tournament/news/egypt-celebrate-african-title-at-home",
  publishedISO: "2023-09-13",
  checkedISO: CHECKED,
};

/** English Wikipedia biography (used for career span and 2017 honour listing). */
export const WIKIPEDIA_PLAYER_SOURCE: SourceRef = {
  label: "Wikipedia — Ahmed Shafik (volleyball)",
  url: "https://en.wikipedia.org/wiki/Ahmed_Shafik_(volleyball)",
  checkedISO: CHECKED,
};

/** Wikipedia event page listing the Egypt silver-medal team at the 2013 games. */
export const WIKIPEDIA_ISLAMIC_SOLIDARITY_2013_SOURCE: SourceRef = {
  label: "Wikipedia — Volleyball at the 2013 Islamic Solidarity Games",
  url: "https://en.wikipedia.org/wiki/Volleyball_at_the_2013_Islamic_Solidarity_Games",
  checkedISO: CHECKED,
};

/** Wikipedia tournament page; lists the 2015 Egypt squad and the final result. */
export const WIKIPEDIA_AFRICAN_2015_SOURCE: SourceRef = {
  label: "Wikipedia — 2015 Men's African Volleyball Championship",
  url: "https://en.wikipedia.org/wiki/2015_Men%27s_African_Volleyball_Championship",
  checkedISO: CHECKED,
};

/** Wikipedia tournament page; Egypt were runners-up in 2017. */
export const WIKIPEDIA_AFRICAN_2017_SOURCE: SourceRef = {
  label: "Wikipedia — 2017 Men's African Volleyball Championship",
  url: "https://en.wikipedia.org/wiki/2017_Men%27s_African_Volleyball_Championship",
  checkedISO: CHECKED,
};

/** Wikipedia tournament page; Egypt won in 2023 and Shafik made the Dream Team. */
export const WIKIPEDIA_AFRICAN_2023_SOURCE: SourceRef = {
  label: "Wikipedia — 2023 Men's African Nations Volleyball Championship",
  url: "https://en.wikipedia.org/wiki/2023_Men%27s_African_Nations_Volleyball_Championship",
  checkedISO: CHECKED,
};

/** Wikipedia squad list; records Shafik in the 2015 World Cup squad, jersey 20. */
export const WIKIPEDIA_WORLD_CUP_2015_SQUADS_SOURCE: SourceRef = {
  label: "Wikipedia — 2015 FIVB Volleyball Men's World Cup squads",
  url: "https://en.wikipedia.org/wiki/2015_FIVB_Volleyball_Men%27s_World_Cup_squads",
  checkedISO: CHECKED,
};

/** Volleybox player page (community database, used for club and event spans). */
export const VOLLEYBOX_PLAYER_SOURCE: SourceRef = {
  label: "Volleybox — Ahmed Shafik (community database)",
  url: "https://volleybox.net/ahmed-shafik-p17327",
  checkedISO: CHECKED,
};

/** Inquirer Sports match report quoting Ahmed Shafik after the win over Iran. */
export const INQUIRER_EGYPT_IRAN_SOURCE: SourceRef = {
  label: "Inquirer Sports — “FIVB Men's World: Egypt topples Iran”",
  url: "https://sports.inquirer.net/639688/fivb-mens-world-egypt-topples-iran-ahead-of-alas-pilipinas-match",
  publishedISO: "2025-09-14",
  checkedISO: CHECKED,
};

/** WorldofVolley match report on the same win. */
export const WORLDOFVOLLEY_EGYPT_IRAN_SOURCE: SourceRef = {
  label: "WorldofVolley — “Egypt Shock Iran at Men's Volleyball World Championship”",
  url: "https://worldofvolley.com/latest_news/fivb/331623/egypt-shock-iran-with-impressive-victory-at-mens-volleyball-world-championship.html",
  publishedISO: "2025-09-14",
  checkedISO: CHECKED,
};

/** Tehran Times match report on the same win. */
export const TEHRAN_TIMES_EGYPT_IRAN_SOURCE: SourceRef = {
  label: "Tehran Times — “Egypt stun Iran at 2025 FIVB World Championship”",
  url: "https://www.tehrantimes.com/news/517831/Egypt-stun-Iran-at-2025-FIVB-World-Championship",
  publishedISO: "2025-09-14",
  checkedISO: CHECKED,
};
