/** Section ids used by the nav, the hero buttons and the 3D scene hotspots. */
export const SECTION_IDS = {
  profile: "profile",
  career: "career",
  achievements: "achievements",
  media: "media",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export type SceneTarget =
  | { kind: "journey" }
  | { kind: "profile" }
  | { kind: "beyond" }
  | { kind: "trophy" }
  | { kind: "medal" };

/** Which section each scene hotspot leads to. */
export const sceneTargetToSection: Record<
  SceneTarget["kind"],
  SectionId | null
> = {
  journey: SECTION_IDS.career,
  profile: SECTION_IDS.profile,
  beyond: null,
  trophy: SECTION_IDS.achievements,
  medal: SECTION_IDS.career,
};