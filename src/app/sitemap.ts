import type { MetadataRoute } from "next";
import { PRODUCTION_ORIGIN } from "@/lib/structured-data";

/**
 * The site is a single, cookie-localised page, so the sitemap has one entry.
 * `lastModified` is the build time; the content itself carries per-record dates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${PRODUCTION_ORIGIN}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
