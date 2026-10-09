import type {
  AchievementRecordType,
  LocalizedText,
  SourceRef,
  VerificationStatus,
} from "./types.ts";
import {
  VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE,
  VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE,
  VOLLEYBALL_WORLD_PLAYER_SOURCE,
  VOLLEYBALL_WORLD_SWEHLY_SOURCE,
  VOLLEYBOX_PLAYER_SOURCE,
  WIKIPEDIA_AFRICAN_2015_SOURCE,
  WIKIPEDIA_AFRICAN_2017_SOURCE,
  WIKIPEDIA_AFRICAN_2023_SOURCE,
  WIKIPEDIA_ISLAMIC_SOLIDARITY_2013_SOURCE,
  WIKIPEDIA_PLAYER_SOURCE,
  WIKIPEDIA_WORLD_CUP_2015_SQUADS_SOURCE,
} from "./sources.ts";

export type AchievementCategory = "club" | "international" | "individual";

export const achievementCategories: AchievementCategory[] = [
  "international",
  "club",
  "individual",
];

export interface AchievementEntry {
  id: string;
  /** Competition or event title, scoped so it reads unambiguously. */
  title: LocalizedText;
  /** Short qualifier, e.g. "Listed in the tournament squad". */
  context: LocalizedText;
  year: number;
  category: AchievementCategory;
  /**
   * Whether this is a tournament appearance or an actual honour.
   *
   * Required rather than optional: a record that does not state which it is must
   * not be rendered, because the alternative is a selection being read as a win.
   */
  recordType: AchievementRecordType;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * The verified achievements archive.
 *
 * Titles and medals are published only where squad membership is supported by a
 * tournament roster, a Dream Team listing or an official match report. Squad
 * selections are `appearance` records and are never counted as wins.
 */
export const achievements: AchievementEntry[] = [
  /* ------------------------------------------------- club titles */
  {
    id: "african-club-2025",
    title: {
      en: "Men's African Volleyball Club Championship 2025",
      ar: "بطولة إفريقيا للأندية للكرة الطائرة ٢٠٢٥",
    },
    context: {
      en: "Won with Al Swehly (Asswehly) of Libya, the club's first continental title, which qualified them for the FIVB Men's Club World Championship.",
      ar: "أُحرز مع نادي السويحلي (أسويهلي) الليبي، وهو أول لقب قاري للنادي، وأهّله لبطولة العالم للأندية.",
    },
    year: 2025,
    category: "club",
    recordType: "title",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_SWEHLY_SOURCE],
  },
  {
    id: "libyan-league-2024-25",
    title: { en: "Libyan League 2024/25", ar: "الدوري الليبي ٢٠٢٤/٢٥" },
    context: {
      en: "Won with Al Swehly (Asswehly) in the 2024/25 season, per the club's recorded squad and honours listing.",
      ar: "أُحرز مع نادي السويحلي (أسويهلي) في موسم ٢٠٢٤/٢٥، وفق قائمة الفريق وإنجازاته المسجلة.",
    },
    year: 2025,
    category: "club",
    recordType: "title",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "libyan-cup-2024-25",
    title: { en: "Libyan Cup 2024/25", ar: "كأس ليبيا ٢٠٢٤/٢٥" },
    context: {
      en: "Won with Al Swehly (Asswehly) in the 2024/25 season, per the club's recorded squad and honours listing.",
      ar: "أُحرز مع نادي السويحلي (أسويهلي) في موسم ٢٠٢٤/٢٥، وفق قائمة الفريق وإنجازاته المسجلة.",
    },
    year: 2025,
    category: "club",
    recordType: "title",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },

  /* ------------------------------------------- national-team honours */
  {
    id: "african-2015",
    title: {
      en: "Men's African Volleyball Championship 2015 — Champions",
      ar: "بطولة إفريقيا للرجال ٢٠١٥ — البطل",
    },
    context: {
      en: "Won with Egypt, the country's eighth continental title; he is listed in the tournament's Egypt squad.",
      ar: "أُحرزت مع مصر، وهو اللقب القاري الثامن للبلاد؛ وهو مدرج ضمن قائمة مصر في البطولة.",
    },
    year: 2015,
    category: "international",
    recordType: "title",
    verification: "verified",
    sources: [WIKIPEDIA_AFRICAN_2015_SOURCE],
  },
  {
    id: "african-2023",
    title: {
      en: "Men's African Nations Championship 2023 — Champions",
      ar: "بطولة إفريقيا للرجال ٢٠٢٣ — البطل",
    },
    context: {
      en: "Won with Egypt in Cairo, the country's ninth continental title; he was also named Best Outside Hitter in the Dream Team.",
      ar: "أُحرزت مع مصر في القاهرة، وهو اللقب القاري التاسع للبلاد؛ كما اختير أفضل مضرب خارجي في التشكيلة المثالية.",
    },
    year: 2023,
    category: "international",
    recordType: "title",
    verification: "verified",
    sources: [
      VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE,
      WIKIPEDIA_AFRICAN_2023_SOURCE,
    ],
  },
  {
    id: "african-2017",
    title: {
      en: "Men's African Volleyball Championship 2017 — Silver",
      ar: "بطولة إفريقيا للرجال ٢٠١٧ — فضية",
    },
    context: {
      en: "Runner-up with Egypt, taking the silver medal.",
      ar: "الوصيف مع مصر ونيل الميدالية الفضية.",
    },
    year: 2017,
    category: "international",
    recordType: "medal",
    verification: "verified",
    sources: [WIKIPEDIA_PLAYER_SOURCE, WIKIPEDIA_AFRICAN_2017_SOURCE],
  },
  {
    id: "islamic-solidarity-2013",
    title: {
      en: "Islamic Solidarity Games 2013 — Silver",
      ar: "دورة ألعاب التضامن الإسلامي ٢٠١٣ — فضية",
    },
    context: {
      en: "Silver medal with the Egypt men's volleyball team; he is listed in the event's medal-winning squad.",
      ar: "الميدالية الفضية مع منتخب مصر للكرة الطائرة؛ وهو مدرج ضمن تشكيلة الفريق الحائز على الميدالية.",
    },
    year: 2013,
    category: "international",
    recordType: "medal",
    verification: "verified",
    sources: [WIKIPEDIA_ISLAMIC_SOLIDARITY_2013_SOURCE],
  },

  /* ------------------------------------------------ individual awards */
  {
    id: "african-club-2025-mvp",
    title: {
      en: "Men's African Volleyball Club Championship 2025 — Most Valuable Player",
      ar: "بطولة إفريقيا للأندية ٢٠٢٥ — أفضل لاعب",
    },
    context: {
      en: "Named tournament MVP with Al Swehly (Asswehly).",
      ar: "اختير أفضل لاعب في البطولة مع نادي السويحلي (أسويهلي).",
    },
    year: 2025,
    category: "individual",
    recordType: "award",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_SWEHLY_SOURCE],
  },
  {
    id: "african-2023-best-outside",
    title: {
      en: "Men's African Nations Championship 2023 — Best Outside Hitter",
      ar: "بطولة إفريقيا للرجال ٢٠٢٣ — أفضل مضرب خارجي",
    },
    context: {
      en: "Named to the tournament's Dream Team with Egypt.",
      ar: "اختير في التشكيلة المثالية للبطولة مع مصر.",
    },
    year: 2023,
    category: "individual",
    recordType: "award",
    verification: "verified",
    sources: [
      VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE,
      WIKIPEDIA_AFRICAN_2023_SOURCE,
    ],
  },

  /* ---------------------------------------------- international appearances */
  {
    id: "mwc-2025",
    title: {
      en: "FIVB Men's World Championship 2025 — Egypt",
      ar: "بطولة العالم للرجال ٢٠٢٥ — مصر",
    },
    context: {
      en: "Scored 18 points in the opening 3-1 win over Iran and 34 points across the tournament. Jersey 18 for this competition.",
      ar: "سجّل ١٨ نقطة في الفوز الافتتاحي على إيران ٣-١ و٣٤ نقطة في البطولة. الرقم ١٨ في هذه البطولة.",
    },
    year: 2025,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [
      VOLLEYBALL_WORLD_PLAYER_SOURCE,
      VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE,
    ],
  },
  {
    id: "challenger-cup-2024",
    title: {
      en: "FIVB Challenger Cup 2024 — Egypt",
      ar: "كأس التحدي ٢٠٢٤ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad for the 2024 FIVB Challenger Cup.",
      ar: "مدرج ضمن قائمة منتخب مصر لكأس التحدي ٢٠٢٤.",
    },
    year: 2024,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "mwc-2022",
    title: {
      en: "FIVB Men's World Championship 2022 — Egypt",
      ar: "بطولة العالم للرجال ٢٠٢٢ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad for the 2022 FIVB Men's World Championship.",
      ar: "مدرج ضمن قائمة منتخب مصر لبطولة العالم للرجال ٢٠٢٢.",
    },
    year: 2022,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "mediterranean-games-2022",
    title: {
      en: "Mediterranean Games 2022 — Egypt",
      ar: "ألعاب البحر المتوسط ٢٠٢٢ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad for the 2022 Mediterranean Games.",
      ar: "مدرج ضمن قائمة منتخب مصر لألعاب البحر المتوسط ٢٠٢٢.",
    },
    year: 2022,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "world-cup-2019",
    title: { en: "FIVB Men's World Cup 2019 — Egypt", ar: "كأس العالم للرجال ٢٠١٩ — مصر" },
    context: {
      en: "Listed in the Egypt squad for the 2019 FIVB World Cup.",
      ar: "مدرج ضمن قائمة منتخب مصر لكأس العالم ٢٠١٩.",
    },
    year: 2019,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "african-games-2019",
    title: { en: "African Games 2019 — Egypt", ar: "الألعاب الإفريقية ٢٠١٩ — مصر" },
    context: {
      en: "Listed in the Egypt squad for the 2019 African Games.",
      ar: "مدرج ضمن قائمة منتخب مصر للألعاب الإفريقية ٢٠١٩.",
    },
    year: 2019,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "challenger-cup-2019",
    title: {
      en: "FIVB Challenger Cup 2019 — Egypt",
      ar: "كأس التحدي ٢٠١٩ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad for the 2019 FIVB Challenger Cup.",
      ar: "مدرج ضمن قائمة منتخب مصر لكأس التحدي ٢٠١٩.",
    },
    year: 2019,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "mwc-2018",
    title: {
      en: "FIVB Men's World Championship 2018 — Egypt",
      ar: "بطولة العالم للرجال ٢٠١٨ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad for the 2018 FIVB Men's World Championship.",
      ar: "مدرج ضمن قائمة منتخب مصر لبطولة العالم للرجال ٢٠١٨.",
    },
    year: 2018,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "world-league-2015-2017",
    title: {
      en: "FIVB World League 2015–2017 — Egypt",
      ar: "الدوري العالمي ٢٠١٥–٢٠١٧ — مصر",
    },
    context: {
      en: "Listed in the Egypt squad across the 2015, 2016 and 2017 FIVB World League seasons.",
      ar: "مدرج ضمن قائمة منتخب مصر في مواسم الدوري العالمي ٢٠١٥ و٢٠١٦ و٢٠١٧.",
    },
    year: 2017,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE, WIKIPEDIA_PLAYER_SOURCE],
  },
  {
    id: "world-cup-2015",
    title: { en: "FIVB Men's World Cup 2015 — Egypt", ar: "كأس العالم للرجال ٢٠١٥ — مصر" },
    context: {
      en: "Listed in the Egypt squad for the 2015 FIVB World Cup with jersey number 20.",
      ar: "مدرج ضمن قائمة منتخب مصر لكأس العالم ٢٠١٥ بالرقم ٢٠.",
    },
    year: 2015,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [WIKIPEDIA_WORLD_CUP_2015_SQUADS_SOURCE],
  },
  {
    id: "u21-world-2013",
    title: {
      en: "FIVB Men's U21 World Championship 2013 — Egypt U21",
      ar: "بطولة العالم للشباب تحت ٢١ عام ٢٠١٣ — مصر",
    },
    context: {
      en: "Represented Egypt at youth level in the 2013 FIVB Men's U21 World Championship.",
      ar: "مثّل مصر في الفئات السنية ببطولة العالم للشباب تحت ٢١ عام ٢٠١٣.",
    },
    year: 2013,
    category: "international",
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
];

/** Record types grouped for the scene panels, which must not blur them together. */
export interface AchievementGroups {
  appearances: AchievementEntry[];
  titles: AchievementEntry[];
  medals: AchievementEntry[];
  awards: AchievementEntry[];
}

/**
 * Splits published records by what they actually are.
 *
 * A group being empty is a fact the UI states plainly rather than papering over,
 * so no panel can imply a title or a medal that does not exist.
 */
export const groupAchievements = (entries: AchievementEntry[]): AchievementGroups => {
  const byType = (type: AchievementRecordType): AchievementEntry[] =>
    entries.filter((entry) => entry.recordType === type);

  return {
    appearances: byType("appearance"),
    titles: byType("title"),
    medals: byType("medal"),
    awards: byType("award"),
  };
};

/**
 * The four sections of the public archive.
 *
 * Deliberately a partition, not a set of overlapping filters: an appearance can
 * never be counted among the titles, and a record belongs to exactly one group.
 */
export interface ArchiveGroups {
  clubTitles: AchievementEntry[];
  nationalResults: AchievementEntry[];
  individualAwards: AchievementEntry[];
  internationalAppearances: AchievementEntry[];
}

export const archiveGroups = (entries: AchievementEntry[]): ArchiveGroups => ({
  clubTitles: entries.filter(
    (entry) => entry.category === "club" && entry.recordType !== "appearance",
  ),
  nationalResults: entries.filter(
    (entry) => entry.category === "international" && entry.recordType !== "appearance",
  ),
  individualAwards: entries.filter(
    (entry) => entry.category === "individual" && entry.recordType !== "appearance",
  ),
  internationalAppearances: entries.filter(
    (entry) => entry.category === "international" && entry.recordType === "appearance",
  ),
});

/** Counts the archive justifies — never a total that conflates types. */
export interface ArchiveTotals {
  clubTitles: number;
  nationalResults: number;
  individualAwards: number;
  internationalAppearances: number;
}

export const archiveTotals = (groups: ArchiveGroups): ArchiveTotals => ({
  clubTitles: groups.clubTitles.length,
  nationalResults: groups.nationalResults.length,
  individualAwards: groups.individualAwards.length,
  internationalAppearances: groups.internationalAppearances.length,
});
