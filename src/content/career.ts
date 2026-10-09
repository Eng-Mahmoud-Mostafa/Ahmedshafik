import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";
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

export type CareerCategory = "club" | "national" | "education";

export interface CareerEntry {
  id: string;
  /** Sort key — newest first when sorted descending by `period`. */
  period: string;
  periodLabel: LocalizedText;
  title: LocalizedText;
  organisation: LocalizedText;
  detail: LocalizedText;
  category: CareerCategory;
  /** Optional competition-scoped extra fact, e.g. a roster jersey number. */
  highlight?: LocalizedText;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * The verified career timeline, newest first.
 *
 * Club and national-team entries carry the same verification gate as everything
 * else. Where a season is only attested by a community database (Volleybox) it
 * is labelled as such in the cited source rather than presented as official.
 */
export const career: CareerEntry[] = [
  {
    id: "egypt-mwc-2025",
    period: "2025.3",
    periodLabel: { en: "2025", ar: "٢٠٢٥" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "FIVB Men's World Championship",
      ar: "بطولة العالم للرجال",
    },
    detail: {
      en: "Played for Egypt at the 2025 FIVB Men's World Championship in the Philippines, wearing jersey 18 for that competition. He scored 18 points in the opening 3-1 win over Iran and finished the tournament with 34 points.",
      ar: "شارك مع منتخب مصر في بطولة العالم للرجال ٢٠٢٥ في الفلبين، وحمل الرقم ١٨ في هذه البطولة. سجّل ١٨ نقطة في الفوز الافتتاحي على إيران ٣-١، وأنهى البطولة برصيد ٣٤ نقطة.",
    },
    highlight: { en: "34 points in the tournament", ar: "٣٤ نقطة في البطولة" },
    category: "national",
    verification: "verified",
    sources: [
      VOLLEYBALL_WORLD_PLAYER_SOURCE,
      VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE,
    ],
  },
  {
    id: "swehly-african-club-2025",
    period: "2025.2",
    periodLabel: { en: "2025", ar: "٢٠٢٥" },
    title: { en: "Al Swehly (Asswehly)", ar: "السويحلي (أسويهلي)" },
    organisation: {
      en: "Men's African Volleyball Club Championship",
      ar: "بطولة إفريقيا للأندية للكرة الطائرة",
    },
    detail: {
      en: "Won the 2025 Men's African Volleyball Club Championship with Al Swehly of Libya, the first Libyan club to take the continental title and a qualifier for the FIVB Men's Club World Championship. He was named the tournament's Most Valuable Player.",
      ar: "أحرز لقب بطولة إفريقيا للأندية للكرة الطائرة ٢٠٢٥ مع نادي السويحلي الليبي، أول نادٍ ليبي يتوّج باللقب القاري ويتأهل إلى بطولة العالم للأندية، واختير أفضل لاعب في البطولة.",
    },
    highlight: { en: "Tournament MVP", ar: "أفضل لاعب في البطولة" },
    category: "club",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_SWEHLY_SOURCE],
  },
  {
    id: "swehly-2024-25",
    period: "2024",
    periodLabel: { en: "2024/25", ar: "٢٠٢٤/٢٥" },
    title: { en: "Al Swehly (Asswehly)", ar: "السويحلي (أسويهلي)" },
    organisation: { en: "Libyan league", ar: "الدوري الليبي" },
    detail: {
      en: "Played the 2024/25 season in Libya with Al Swehly (Asswehly), the club he captained to the 2025 African Club Championship title.",
      ar: "لعب موسم ٢٠٢٤/٢٥ في ليبيا مع نادي السويحلي (أسويهلي)، الذي قاده إلى لقب بطولة إفريقيا للأندية ٢٠٢٥.",
    },
    category: "club",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_SWEHLY_SOURCE, VOLLEYBOX_PLAYER_SOURCE],
  },
  {
    id: "egypt-african-2023",
    period: "2023",
    periodLabel: { en: "2023", ar: "٢٠٢٣" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "Men's African Nations Championship",
      ar: "بطولة إفريقيا للرجال",
    },
    detail: {
      en: "Won the 2023 Men's African Nations Championship with Egypt in Cairo, the country's ninth continental title, and was named Best Outside Hitter in the tournament's Dream Team.",
      ar: "أحرز مع مصر لقب بطولة إفريقيا للرجال ٢٠٢٣ في القاهرة، وهو اللقب القاري التاسع لمصر، واختير أفضل مضرب خارجي في التشكيلة المثالية للبطولة.",
    },
    highlight: { en: "Best Outside Hitter", ar: "أفضل مضرب خارجي" },
    category: "national",
    verification: "verified",
    sources: [
      VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE,
      WIKIPEDIA_AFRICAN_2023_SOURCE,
    ],
  },
  {
    id: "egypt-2015-2019",
    period: "2019",
    periodLabel: { en: "2015–2019", ar: "٢٠١٥–٢٠١٩" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "FIVB World League, World Cup and World Championship",
      ar: "الدوري العالمي وكأس العالم وبطولة العالم",
    },
    detail: {
      en: "Represented Egypt through the 2015–2019 international cycle, including the 2015 and 2019 FIVB World Cup, the 2018 FIVB World Championship and the FIVB World League.",
      ar: "مثّل مصر خلال الدورة الدولية ٢٠١٥–٢٠١٩، ومنها كأس العالم ٢٠١٥ و٢٠١٩، وبطولة العالم ٢٠١٨، والدوري العالمي.",
    },
    highlight: {
      en: "Jersey 20 at the 2015 World Cup",
      ar: "الرقم ٢٠ في كأس العالم ٢٠١٥",
    },
    category: "national",
    verification: "verified",
    sources: [
      WIKIPEDIA_WORLD_CUP_2015_SQUADS_SOURCE,
      VOLLEYBOX_PLAYER_SOURCE,
    ],
  },
  {
    id: "egypt-african-2017",
    period: "2017",
    periodLabel: { en: "2017", ar: "٢٠١٧" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "Men's African Volleyball Championship",
      ar: "بطولة إفريقيا للرجال",
    },
    detail: {
      en: "Member of the Egypt squad that finished second at the 2017 Men's African Volleyball Championship, taking the silver medal.",
      ar: "عضو في قائمة منتخب مصر التي حلّت ثانية في بطولة إفريقيا للرجال ٢٠١٧ ونالت الميدالية الفضية.",
    },
    category: "national",
    verification: "verified",
    sources: [WIKIPEDIA_PLAYER_SOURCE, WIKIPEDIA_AFRICAN_2017_SOURCE],
  },
  {
    id: "al-ahly",
    period: "2015.2",
    periodLabel: { en: "2015–2024", ar: "٢٠١٥–٢٠٢٤" },
    title: { en: "Al Ahly SC", ar: "النادي الأهلي" },
    organisation: { en: "Egyptian league", ar: "الدوري المصري" },
    detail: {
      en: "Spent his senior club career with Al Ahly SC in the Egyptian league from 2015 until he moved abroad for the 2024/25 season.",
      ar: "لعب في صفوف النادي الأهلي بالدوري المصري منذ عام ٢٠١٥ حتى انتقاله للاحتراف خارج مصر في موسم ٢٠٢٤/٢٥.",
    },
    category: "club",
    verification: "verified",
    sources: [WIKIPEDIA_PLAYER_SOURCE, VOLLEYBALL_WORLD_SWEHLY_SOURCE],
  },
  {
    id: "egypt-african-2015",
    period: "2015.1",
    periodLabel: { en: "2015", ar: "٢٠١٥" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "Men's African Volleyball Championship",
      ar: "بطولة إفريقيا للرجال",
    },
    detail: {
      en: "Named in the Egypt squad that won the 2015 Men's African Volleyball Championship, the country's eighth continental title.",
      ar: "مدرج ضمن قائمة منتخب مصر الذي أحرز بطولة إفريقيا للرجال ٢٠١٥، وهو اللقب القاري الثامن لمصر.",
    },
    highlight: { en: "African champion", ar: "بطل إفريقيا" },
    category: "national",
    verification: "verified",
    sources: [WIKIPEDIA_AFRICAN_2015_SOURCE],
  },
  {
    id: "egypt-islamic-solidarity-2013",
    period: "2013.2",
    periodLabel: { en: "2013", ar: "٢٠١٣" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: { en: "Islamic Solidarity Games", ar: "دورة ألعاب التضامن الإسلامي" },
    detail: {
      en: "Part of the Egypt men's volleyball team that won silver at the 2013 Islamic Solidarity Games.",
      ar: "ضمن منتخب مصر للكرة الطائرة الذي نال الميدالية الفضية في دورة ألعاب التضامن الإسلامي ٢٠١٣.",
    },
    category: "national",
    verification: "verified",
    sources: [WIKIPEDIA_ISLAMIC_SOLIDARITY_2013_SOURCE],
  },
  {
    id: "egypt-u21-2013",
    period: "2013.1",
    periodLabel: { en: "2013", ar: "٢٠١٣" },
    title: { en: "Egypt under-21", ar: "منتخب مصر تحت ٢١" },
    organisation: {
      en: "FIVB Men's U21 World Championship",
      ar: "بطولة العالم للشباب تحت ٢١",
    },
    detail: {
      en: "Represented Egypt at youth level, including the FIVB Men's U21 World Championship.",
      ar: "مثّل مصر في الفئات السنية، ومنها بطولة العالم للشباب تحت ٢١.",
    },
    category: "national",
    verification: "verified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
];

/**
 * Rows that are intentionally not published yet.
 *
 * They exist so the shape of the timeline is obvious for whoever fills it in
 * next. `isPubliclyRenderable()` filters them out of the rendered page, so
 * nothing unverified can leak into the UI.
 */
export const pendingCareerEntries: CareerEntry[] = [
  {
    id: "club-al-ula-2025-26",
    period: "2025.4",
    periodLabel: { en: "2025/26", ar: "٢٠٢٥/٢٦" },
    title: { en: "Al-Ula (Saudi Arabia)", ar: "العلا (السعودية)" },
    organisation: { en: "Listed by a community database", ar: "بحسب قاعدة بيانات مجتمعية" },
    detail: {
      en: "A 2025/26 move to Al-Ula in Saudi Arabia is listed on Volleybox, but the same database's Al Swehly squad page still lists him for 2025/26. The two listings conflict and no official source confirms the move, so it is withheld until the club is confirmed.",
      ar: "تدرج قاعدة بيانات Volleybox انتقالًا إلى نادي العلا في السعودية لموسم ٢٠٢٥/٢٦، لكن صفحة نادي السويحلي في القاعدة نفسها ما زالت تدرجه في الموسم ذاته. التدرجان متعارضان ولا يثبت الانتقال أي مصدر رسمي، لذلك يُحجب حتى تأكيد النادي.",
    },
    category: "club",
    verification: "unverified",
    sources: [VOLLEYBOX_PLAYER_SOURCE],
  },
];

export const careerCategories: CareerCategory[] = ["national", "club", "education"];
