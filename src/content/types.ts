/**
 * Shared content types for the portfolio.
 *
 * Editorial rule (unchanged since stage one): a record is only rendered publicly
 * when its `verification` status is `verified` or `owner-approved`. Anything
 * else is compiled out of the public UI (see `isPubliclyRenderable`).
 */

export type Locale = "en" | "ar";

/** A value that carries an English and an Arabic variant. */
export type LocalizedText = Record<Locale, string>;

/**
 * Verification status of a factual record.
 * - `verified`      — confirmed against a cited public source.
 * - `owner-approved` — supplied and cleared by the player or his management.
 * - `unverified`    — drafted but not confirmed; never rendered publicly.
 */
export type VerificationStatus =
  | "verified"
  | "owner-approved"
  | "unverified";

/** Public sources backing a record, when one exists. */
export interface SourceRef {
  label: string;
  url: string;
}

export interface VerifiedRecord {
  verification: VerificationStatus;
  /** Sources that back the record. Empty when there is nothing public to cite. */
  sources: SourceRef[];
}

export const isPubliclyRenderable = (record: VerifiedRecord): boolean =>
  record.verification === "verified" || record.verification === "owner-approved";

/** Accent/emphasis level used by small inline facts. */
export type FactTone = "red" | "gold" | "neutral";

export interface FactItem {
  id: string;
  label: LocalizedText;
  /** Localized on purpose: a bare string here would leak English into Arabic mode. */
  value: LocalizedText;
  tone?: FactTone;
}

/**
 * What kind of record an achievement entry actually is.
 *
 * This exists so a tournament selection can never be presented as a title, and
 * so the scene's decorative trophy and medal cannot imply either. Only the type
 * the record can actually support is published.
 */
export type AchievementRecordType =
  /** Selected for / took part in a competition. Never a win. */
  | "appearance"
  /** A championship title. */
  | "title"
  /** A medal at a competition. */
  | "medal"
  /** An individual award. */
  | "award";

/**
 * Personal ("beyond the court") material.
 *
 * Deliberately allowed to be published only when the player or his management
 * approved it, which is why it carries the same verification gate as factual
 * records.
 */
export interface BeyondEntry extends VerifiedRecord {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  sources: SourceRef[];
}