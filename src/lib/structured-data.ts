import { achievements } from "../content/achievements.ts";
import { profile } from "../content/profile.ts";
import type { Locale } from "../content/types.ts";

/** Canonical origin of the deployed site. Also used as the metadata base. */
export const PRODUCTION_ORIGIN = "https://ahmedshafik.vercel.app";

/**
 * A conservative subset of schema.org/Person.
 *
 * Only fields the portfolio can actually support from published, verified
 * content are included. There is deliberately no `sameAs`: no verified social
 * profile exists to point at, and inventing one would be a false claim.
 */
export interface PersonStructuredData {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  alternateName: string[];
  description: string;
  url: string;
  mainEntityOfPage: string;
  birthDate: string;
  nationality: { "@type": "Country"; name: string };
  height: { "@type": "QuantitativeValue"; value: number; unitCode: string };
  jobTitle: string;
  knowsAbout: string[];
  award: string[];
}

/**
 * Builds the JSON-LD payload from the same verified records the page renders.
 *
 * `locale` selects the language of the localised honour titles. The website is
 * never described as "official": that status has not been confirmed.
 */
export const buildPersonStructuredData = (
  locale: Locale,
  description: string,
): PersonStructuredData => {
  const honourTitles = achievements
    .filter((entry) => entry.recordType !== "appearance")
    .map((entry) => entry.title[locale]);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: [profile.professionalName, profile.nameArabic],
    description,
    url: PRODUCTION_ORIGIN,
    mainEntityOfPage: PRODUCTION_ORIGIN,
    birthDate: profile.dateOfBirthISO,
    nationality: { "@type": "Country", name: "Egypt" },
    height: { "@type": "QuantitativeValue", value: profile.heightCm, unitCode: "CMT" },
    jobTitle: "Volleyball player",
    knowsAbout: ["Volleyball", "Outside hitter"],
    award: honourTitles,
  };
};

/**
 * Serialises structured data for a `<script>` tag.
 *
 * `JSON.stringify` leaves `<` untouched, so a value containing it could close
 * the script element; escaping the character removes that possibility.
 */
export const serializeStructuredData = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c");
