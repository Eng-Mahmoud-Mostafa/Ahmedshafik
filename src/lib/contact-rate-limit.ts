/**
 * Best-effort per-instance rate limiting.
 *
 * This is deliberately *not* the only abuse protection: serverless instances do
 * not share memory, so a determined burst can spread across them. The signed
 * submission token (`contact-token.ts`) is the cross-instance gate; this limiter
 * is a cheap second layer that blunts repeated requests hitting the same
 * instance without adding a dependency or a shared store.
 */

export const RATE_LIMIT_MAX = 6;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;

/** Keep the map from growing without bound in a long-lived instance. */
const MAX_TRACKED_KEYS = 2_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** Milliseconds until the window resets; 0 when allowed. */
  retryAfterMs: number;
}

export const rateLimitAllow = (
  key: string,
  now: number = Date.now(),
): RateLimitResult => {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;

  // Opportunistic cleanup so the map cannot grow forever.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [entryKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(entryKey);
    }
  }

  return { allowed: true, retryAfterMs: 0 };
};

/** Exposed for tests so one case cannot leak state into the next. */
export const resetRateLimit = (): void => {
  buckets.clear();
};
