/** Tiny class-name joiner; avoids pulling in a dependency for this. */
export const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");