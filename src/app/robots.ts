import type { MetadataRoute } from "next";
import { metaUrl } from "@/constants";
import { fetchJobsPageForSitemap } from "@/functions/sitemapJobPages";

// Keep auth/account pages and the internal revalidate API out of the crawl —
// they have no indexable content and just burn crawl budget.
//
// sitemap.ts's generateSitemaps splits the sitemap into one file per chunk
// (/sitemap/0.xml for static pages, /sitemap/1.xml.. for job pages) instead
// of a single /sitemap.xml — Next has no automatic sitemap index for that,
// so every chunk's URL has to be listed here explicitly, computed the same
// way sitemap.ts computes its chunk count so the two can't drift apart.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { totalPages } = await fetchJobsPageForSitemap(1);

  const sitemap = [
    `${metaUrl}/sitemap/0.xml`,
    ...Array.from(
      { length: totalPages },
      (_, i) => `${metaUrl}/sitemap/${i + 1}.xml`,
    ),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/sign-in", "/sign-up", "/api/"],
    },
    sitemap,
  };
}
