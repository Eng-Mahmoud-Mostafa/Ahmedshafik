import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";
import {
  INQUIRER_EGYPT_IRAN_SOURCE,
  TEHRAN_TIMES_EGYPT_IRAN_SOURCE,
  VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE,
  VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE,
  VOLLEYBALL_WORLD_EGYPT_IRAN_VIDEO_SOURCE,
  VOLLEYBALL_WORLD_SWEHLY_SOURCE,
  WORLDOFVOLLEY_EGYPT_IRAN_SOURCE,
} from "./sources.ts";

export type PressKind = "news" | "video" | "interview";

export interface PressEntry {
  id: string;
  kind: PressKind;
  title: LocalizedText;
  /** Publisher name, shown as-is and never translated. */
  outlet: string;
  /** Publication date, ISO `YYYY-MM-DD`, when the publisher states one. */
  dateISO: string;
  summary: LocalizedText;
  /** Canonical link to the original item. Always the publisher's own page. */
  url: string;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * Press coverage and official video highlights.
 *
 * These are links to original sources, never copied media: the site points at
 * the publisher's page and lets them serve the article or video. Nothing here
 * is embedded without a confirmed canonical URL, and no item is invented.
 *
 * `interview` exists so a genuine sit-down interview can be added later; none
 * has been verified, so none is published.
 */
export const press: PressEntry[] = [
  {
    id: "egypt-iran-vw-report",
    kind: "news",
    title: {
      en: "Egypt produce sensational win over Iran at Men's Volleyball World Championship",
      ar: "مصر تحقق فوزًا لافتًا على إيران في بطولة العالم للرجال",
    },
    outlet: "Volleyball World",
    dateISO: "2025-09-14",
    summary: {
      en: "Official match report: Ahmed Shafik Said scored 18 points as Egypt beat Iran 3-1 in their opening game of the 2025 World Championship.",
      ar: "التقرير الرسمي: سجّل أحمد شفيق ١٨ نقطة في فوز مصر على إيران ٣-١ في المباراة الافتتاحية ببطولة العالم ٢٠٢٥.",
    },
    url: VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE.url,
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_EGYPT_IRAN_SOURCE],
  },
  {
    id: "egypt-iran-highlights",
    kind: "video",
    title: {
      en: "Iran vs Egypt — official match highlights",
      ar: "إيران ضد مصر — الملخص الرسمي للمباراة",
    },
    outlet: "Volleyball World",
    dateISO: "2025-09-14",
    summary: {
      en: "Official highlights of Egypt's 3-1 Pool A win over Iran at the 2025 FIVB Men's World Championship.",
      ar: "الملخص الرسمي لفوز مصر على إيران ٣-١ في المجموعة الأولى ببطولة العالم للرجال ٢٠٢٥.",
    },
    url: VOLLEYBALL_WORLD_EGYPT_IRAN_VIDEO_SOURCE.url,
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_EGYPT_IRAN_VIDEO_SOURCE],
  },
  {
    id: "swehly-african-crown",
    kind: "news",
    title: {
      en: "Swehly emerge as first Libyan team to conquer African crown",
      ar: "السويحلي أول فريق ليبي يتوّج باللقب الإفريقي",
    },
    outlet: "Volleyball World",
    dateISO: "2025-04-30",
    summary: {
      en: "Reports Al Swehly's African Club Championship title and the Most Valuable Player award for Ahmed Shafik.",
      ar: "يتناول لقب السويحلي ببطولة إفريقيا للأندية وجائزة أفضل لاعب لأحمد شفيق.",
    },
    url: VOLLEYBALL_WORLD_SWEHLY_SOURCE.url,
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_SWEHLY_SOURCE],
  },
  {
    id: "egypt-african-title-home",
    kind: "news",
    title: {
      en: "Egypt celebrate African title at home",
      ar: "مصر تحتفل باللقب الإفريقي على أرضها",
    },
    outlet: "Volleyball World",
    dateISO: "2023-09-13",
    summary: {
      en: "Reports Egypt's ninth African title and names Ahmed Shafik to the Dream Team as Best Outside Hitter.",
      ar: "يتناول لقب مصر الإفريقي التاسع ويضمّ أحمد شفيق إلى التشكيلة المثالية كأفضل مضرب خارجي.",
    },
    url: VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE.url,
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_AFRICAN_2023_SOURCE],
  },
  {
    id: "egypt-iran-inquirer",
    kind: "news",
    title: {
      en: "FIVB Men's World: Egypt topples Iran ahead of Alas Pilipinas match",
      ar: "كأس العالم للرجال: مصر تُسقط إيران قبل مواجهة الفلبين",
    },
    outlet: "Inquirer Sports",
    dateISO: "2025-09-14",
    summary: {
      en: "Match report that leads on Ahmed Shafik's 18-point performance and quotes him after the win.",
      ar: "تقرير يقود بنتيجة أحمد شفيق (١٨ نقطة) وينقل تصريحًا له بعد الفوز.",
    },
    url: INQUIRER_EGYPT_IRAN_SOURCE.url,
    verification: "verified",
    sources: [INQUIRER_EGYPT_IRAN_SOURCE],
  },
  {
    id: "egypt-iran-worldofvolley",
    kind: "news",
    title: {
      en: "Egypt Shock Iran with Impressive Victory at Men's Volleyball World Championship",
      ar: "مصر تفاجئ إيران بفوز لافت في بطولة العالم للرجال",
    },
    outlet: "WorldofVolley",
    dateISO: "2025-09-14",
    summary: {
      en: "Match report crediting Ahmed Shafik with 18 points at a 62% attack success rate.",
      ar: "تقرير ينسب إلى أحمد شفيق ١٨ نقطة بنسبة نجاح هجومي ٦٢٪.",
    },
    url: WORLDOFVOLLEY_EGYPT_IRAN_SOURCE.url,
    verification: "verified",
    sources: [WORLDOFVOLLEY_EGYPT_IRAN_SOURCE],
  },
  {
    id: "egypt-iran-tehran-times",
    kind: "news",
    title: { en: "Egypt stun Iran at 2025 FIVB World Championship", ar: "مصر تُذهل إيران في مونديال ٢٠٢٥" },
    outlet: "Tehran Times",
    dateISO: "2025-09-14",
    summary: {
      en: "Match report noting Ahmed Shafik led Egypt with 18 points against Iran.",
      ar: "تقرير يشير إلى تصدّر أحمد شفيق لهدافي مصر برصيد ١٨ نقطة أمام إيران.",
    },
    url: TEHRAN_TIMES_EGYPT_IRAN_SOURCE.url,
    verification: "verified",
    sources: [TEHRAN_TIMES_EGYPT_IRAN_SOURCE],
  },
];

/** The kinds actually present, so filters never advertise an empty category. */
export const publishedPressKinds = (entries: PressEntry[]): PressKind[] => {
  const order: PressKind[] = ["video", "news", "interview"];
  return order.filter((kind) => entries.some((entry) => entry.kind === kind));
};
