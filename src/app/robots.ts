import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/lib/deployment";
import { PRODUCTION_ORIGIN } from "@/lib/structured-data";

/**
 * robots.txt.
 *
 * Production allows indexing but keeps the API surface out of the index.
 * Preview and development deployments are disallowed entirely, so a preview URL
 * can never compete with production in search results.
 */
export default function robots(): MetadataRoute.Robots {
  const indexable = isProductionDeployment();

  return {
    rules: indexable
      ? { userAgent: "*", allow: "/", disallow: "/api/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${PRODUCTION_ORIGIN}/sitemap.xml`,
    host: PRODUCTION_ORIGIN,
  };
}
