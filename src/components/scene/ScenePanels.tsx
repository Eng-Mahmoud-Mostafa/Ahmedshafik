"use client";

import type { ComponentType, ReactNode } from "react";
import type { Locale } from "@/content/types";
import {
  beyondPanel,
  clubAchievementsPanel,
  internationalCareerPanel,
  journeyPanel,
  playerProfilePanel,
} from "@/content/panels";
import type { AchievementEntry, CareerEntry } from "@/content/panels";
import { dictionaryFor, pick } from "@/i18n/dictionary";
import { EmptyState, SourceList, VerificationBadge } from "@/components/ui/Primitives";
import { SceneDialog } from "./SceneDialog";

/**
 * The panels opened from the scene's five hotspots.
 *
 * Each is populated by a selector in `src/content/panels.ts`, which applies the
 * same verification gate as the full page sections — so a panel can never show a
 * record the page would hide, and an empty group is reported as empty rather than
 * filled in.
 *
 * Nothing here invents content: no quotes, thoughts, ambitions, titles or medal
 * counts. Where records are missing the panel says so, and each panel links onward
 * to the full section so it is never a dead end.
 */

export type PanelId = "journey" | "profile" | "beyond" | "trophy" | "medal";

/** Which full section each panel links onward to. `null` when none exists yet. */
const PANEL_SECTION: Record<PanelId, string | null> = {
  journey: "career",
  profile: "profile",
  beyond: null,
  trophy: "achievements",
  medal: "career",
};

/* ----------------------------------------------------------------- shared bits */

function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-[0.6rem] font-semibold tracking-[0.2em] text-bone-faint uppercase rtl:tracking-normal">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-charcoal-line" />
    </h4>
  );
}

/**
 * A labelled group of records, or an explicit "none verified" line when empty.
 *
 * The empty line is the point: it makes an absence a stated fact rather than
 * something the visitor has to infer from a blank area.
 */
function VerifiedGroup<T>({
  label,
  entries,
  emptyLabel,
  renderEntry,
}: {
  label: string;
  entries: T[];
  emptyLabel: string;
  renderEntry: (entry: T) => ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <GroupHeading>{label}</GroupHeading>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-charcoal-line px-4 py-3 text-sm text-bone-muted">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={String((entry as { id: string }).id)}>{renderEntry(entry)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ journey */

function JourneyPanelBody({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const { entries } = journeyPanel();

  if (entries.length === 0) {
    return (
      <EmptyState
        title={t.scene.panelJourneyEmptyTitle}
        body={t.scene.panelJourneyEmptyBody}
      />
    );
  }

  return (
    <ol className="flex flex-col gap-6 border-s border-charcoal-line ps-6">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute -start-[1.6rem] top-2 size-2.5 rounded-full bg-egypt-red shadow-glow-red"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-display text-sm font-bold tracking-[0.2em] text-gold uppercase rtl:tracking-normal">
              {pick(entry.periodLabel, locale)}
            </span>
            <VerificationBadge
              status={entry.verification}
              label={
                entry.verification === "owner-approved"
                  ? t.profile.ownerApproved
                  : t.profile.verified
              }
            />
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-bone">
            {pick(entry.title, locale)}
          </h3>
          <p className="mt-1 text-sm text-bone-muted">{pick(entry.organisation, locale)}</p>
          <p className="mt-2.5 text-sm leading-relaxed text-bone/80">
            {pick(entry.detail, locale)}
          </p>
          {entry.highlight ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/8 px-3 py-1.5 text-xs font-semibold text-gold">
              {pick(entry.highlight, locale)}
            </p>
          ) : null}
          <SourceList
            sources={entry.sources}
            label={t.profile.sourcesLabel}
            className="mt-3"
          />
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ profile */

function ProfilePanelBody({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const { facts, biography, competitions, sources } = playerProfilePanel();

  return (
    <div className="flex flex-col gap-7">
      <p className="text-sm leading-relaxed text-bone/85">{pick(biography, locale)}</p>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-charcoal-line bg-charcoal-line">
        {facts.map((fact) => (
          <div key={fact.id} className="bg-charcoal px-4 py-3.5">
            <dt className="text-[0.6rem] tracking-[0.18em] text-bone-faint uppercase rtl:tracking-normal">
              {pick(fact.label, locale)}
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-bone">
              {pick(fact.value, locale)}
            </dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <GroupHeading>{t.profile.competitionsLabel}</GroupHeading>
        <ul className="flex flex-col gap-3">
          {competitions.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-charcoal-line bg-charcoal/40 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-base font-semibold text-bone">
                  {pick(entry.competition, locale)}
                </p>
                <span className="shrink-0 font-display text-lg font-bold text-gold">
                  {entry.jerseyNumber}
                </span>
              </div>
              <p className="mt-1 text-xs text-bone-muted">
                {pick(entry.team, locale)} · {entry.year}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-bone/80">
                {pick(entry.note, locale)}
              </p>
              <SourceList
                sources={entry.sources}
                label={t.profile.sourcesLabel}
                className="mt-3"
              />
            </li>
          ))}
        </ul>
        {/* Jersey numbers are competition-scoped; this says so on the panel too. */}
        <p className="text-xs text-bone-faint">{t.profile.scopeNote}</p>
      </section>

      <SourceList sources={sources} label={t.profile.sourcesLabel} />
    </div>
  );
}

/* ------------------------------------------------------------------- beyond */

function BeyondPanelBody({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const { entries } = beyondPanel();

  if (entries.length === 0) {
    return (
      <EmptyState title={t.scene.beyondEmptyTitle} body={t.scene.beyondEmptyBody} />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-xl border border-charcoal-line bg-charcoal/40 p-5">
          <h3 className="font-display text-lg font-semibold text-bone">
            {pick(entry.title, locale)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-bone/80">
            {pick(entry.body, locale)}
          </p>
          <SourceList sources={entry.sources} label={t.profile.sourcesLabel} className="mt-3" />
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------------- club */

function ClubPanelBody({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const { titles, medals, clubRecords } = clubAchievementsPanel();

  const renderEntry = (entry: AchievementEntry) => (
    <div className="rounded-xl border border-charcoal-line bg-charcoal/40 px-4 py-4">
      <p className="font-display text-base font-semibold text-bone">
        {pick(entry.title, locale)}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-bone-muted">
        {pick(entry.context, locale)}
      </p>
      <SourceList sources={entry.sources} label={t.profile.sourcesLabel} className="mt-3" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/*
        The emptiness is stated first, so an empty club panel cannot read as a
        rendering failure or imply honours that are being hidden.
      */}
      {titles.length === 0 && medals.length === 0 ? (
        <EmptyState title={t.scene.panelClubEmptyTitle} body={t.scene.panelClubEmptyBody} />
      ) : null}

      <VerifiedGroup
        label={t.scene.panelTitlesLabel}
        entries={titles}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderEntry}
      />
      <VerifiedGroup
        label={t.scene.panelMedalsLabel}
        entries={medals}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderEntry}
      />
      <VerifiedGroup
        label={t.scene.panelAppearancesLabel}
        entries={clubRecords}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderEntry}
      />
    </div>
  );
}

/* ------------------------------------------------------------ international */

function InternationalPanelBody({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const { appearances, titles, medals, awards, nationalEntries } =
    internationalCareerPanel();

  const renderAppearance = (entry: AchievementEntry) => (
    <div className="rounded-xl border border-charcoal-line bg-charcoal/40 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-display text-sm font-bold tracking-[0.18em] text-gold uppercase rtl:tracking-normal">
          {entry.year}
        </span>
        <VerificationBadge status={entry.verification} label={t.profile.verified} />
      </div>
      <p className="mt-2 font-display text-base font-semibold text-bone">
        {pick(entry.title, locale)}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-bone-muted">
        {pick(entry.context, locale)}
      </p>
      <SourceList sources={entry.sources} label={t.profile.sourcesLabel} className="mt-3" />
    </div>
  );

  const renderNational = (entry: CareerEntry) => (
    <div className="rounded-xl border border-charcoal-line bg-charcoal/40 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-display text-sm font-bold tracking-[0.18em] text-gold uppercase rtl:tracking-normal">
          {pick(entry.periodLabel, locale)}
        </span>
        <VerificationBadge status={entry.verification} label={t.profile.verified} />
      </div>
      <p className="mt-2 font-display text-base font-semibold text-bone">
        {pick(entry.title, locale)}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-bone-muted">
        {pick(entry.organisation, locale)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        {pick(entry.detail, locale)}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {titles.length === 0 && medals.length === 0 ? (
        <EmptyState
          title={t.scene.panelInternationalEmptyTitle}
          body={t.scene.panelInternationalEmptyBody}
        />
      ) : null}

      {/*
        Appearances are labelled and footnoted as appearances. This distinction is
        the reason the panel exists.
      */}
      <VerifiedGroup
        label={t.scene.panelAppearancesLabel}
        entries={appearances}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderAppearance}
      />
      <VerifiedGroup
        label={t.scene.panelTitlesLabel}
        entries={titles}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderAppearance}
      />
      <VerifiedGroup
        label={t.scene.panelMedalsLabel}
        entries={medals}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderAppearance}
      />
      <VerifiedGroup
        label={t.scene.panelAwardsLabel}
        entries={awards}
        emptyLabel={t.scene.panelNoneVerified}
        renderEntry={renderAppearance}
      />

      {nationalEntries.length > 0 ? (
        <VerifiedGroup
          label={t.scene.panelInternationalTitle}
          entries={nationalEntries}
          emptyLabel={t.scene.panelNoneVerified}
          renderEntry={renderNational}
        />
      ) : null}

      {appearances.length > 0 ? (
        <p className="rounded-xl border border-gold/25 bg-gold/6 px-4 py-3 text-xs leading-relaxed text-bone-muted">
          {t.scene.panelAppearancesNote}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ export */

const PANEL_TITLE_KEY = {
  journey: "panelJourneyTitle",
  profile: "panelProfileTitle",
  beyond: "beyondTitle",
  trophy: "panelClubTitle",
  medal: "panelInternationalTitle",
} as const;

const PANEL_BODY: Record<PanelId, ComponentType<{ locale: Locale }>> = {
  journey: JourneyPanelBody,
  profile: ProfilePanelBody,
  beyond: BeyondPanelBody,
  trophy: ClubPanelBody,
  medal: InternationalPanelBody,
};

/**
 * Renders the panel for whichever hotspot is open.
 *
 * Only one panel is ever mounted — the dialog body is a switch — so no panel's
 * element ids can collide in the accessibility tree.
 */
export function ScenePanel({
  panel,
  onClose,
  onGoToSection,
  locale,
}: {
  panel: PanelId | null;
  onClose: () => void;
  onGoToSection: (sectionId: string) => void;
  locale: Locale;
}) {
  const t = dictionaryFor(locale);
  if (!panel) return null;

  const section = PANEL_SECTION[panel];
  const Body = PANEL_BODY[panel];

  return (
    <SceneDialog
      open
      onClose={onClose}
      eyebrow={t.scene.actionsLabel}
      title={t.scene[PANEL_TITLE_KEY[panel]]}
      closeLabel={t.scene.panelClose}
      footer={
        <>
          {/* The placeholder disclaimer follows the visitor into every panel. */}
          <p className="text-[0.7rem] leading-relaxed text-bone-faint">
            {t.scene.characterNote}
          </p>
          {section ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToSection(section);
              }}
              className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {t.scene.panelViewSection}
              <span aria-hidden="true" className="ms-2 rtl:rotate-180">
                →
              </span>
            </button>
          ) : null}
        </>
      }
    >
      <Body locale={locale} />
    </SceneDialog>
  );
}