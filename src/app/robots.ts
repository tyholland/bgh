import type { MetadataRoute } from "next";
import { metaUrl } from "@/constants";

// Keep auth/account pages and the internal revalidate API out of the crawl —
// they have no indexable content and just burn crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/sign-in", "/sign-up", "/api/"],
    },
    sitemap: `${metaUrl}/sitemap.xml`,
  };
}
