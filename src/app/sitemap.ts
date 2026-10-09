import type { MetadataRoute } from "next";
import { metaUrl } from "@/constants";

// Static, content-worthy pages only — auth/account pages are excluded here
// and blocked in robots.ts since they have nothing for search engines to index.
//
// TODO: once individual job postings get their own route (/jobs/[id]), this
// should become dynamic — fetch job ids/slugs from the API and append one
// entry per job (likely via generateSitemaps for pagination, given volume).
const staticPages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "hourly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/road-map", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/request", changeFrequency: "yearly", priority: 0.3 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticPages.map(({ path, changeFrequency, priority }) => ({
    url: `${metaUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
