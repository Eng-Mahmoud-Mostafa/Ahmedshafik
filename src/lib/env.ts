/**
 * A minimal, read-only view of environment variables.
 *
 * Deliberately looser than `NodeJS.ProcessEnv` so callers can pass a plain
 * partial object (tests, in particular) without inventing `NODE_ENV`.
 */
export type EnvLike = Record<string, string | undefined>;
