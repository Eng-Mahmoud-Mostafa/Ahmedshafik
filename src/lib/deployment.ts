import type { EnvLike } from "./env.ts";

/**
 * Deployment awareness for indexing and metadata.
 *
 * Vercel sets `VERCEL_ENV` to `production`, `preview` or `development`. Preview
 * builds must never be indexed, so anything other than `production` counts as
 * non-indexable. Outside Vercel a production build (`next build && next start`)
 * is still production, which keeps local `next start` behaving like the real
 * site without being mistaken for a preview.
 */
export const isProductionDeployment = (
  env: EnvLike = process.env,
): boolean => {
  const vercelEnv = env.VERCEL_ENV;
  if (typeof vercelEnv === "string" && vercelEnv.length > 0) {
    return vercelEnv === "production";
  }
  return env.NODE_ENV === "production";
};
