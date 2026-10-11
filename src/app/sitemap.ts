import type { MetadataRoute } from "next";
import { metaUrl } from "@/constants";
import { jobHref } from "@/functions/jobHref";
import { fetchJobsPageForSitemap } from "@/functions/sitemapJobPages";

// Static, content-worthy pages only — auth/account pages are excluded here
// and blocked in robots.ts since they have nothing for search engines to index.
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

// Sitemap id 0 is the static pages above; ids 1..totalPages map 1:1 to
// /v1/jobs pages (see fetchJobsPageForSitemap), each becoming its own
// generated file at /sitemap/<id>.xml. robots.ts lists all of them.
//
// Until the API returns an `id` on each job (BACKEND_REPO_PLAN.md §5 — the
// same field /jobs/[id] needs to fetch a job at all), every job sitemap
// comes back empty: jobHref skips rows with no id rather than linking to a
// page that 404s, so this is safe to ship ahead of that.
export async function generateSitemaps() {
  const { totalPages } = await fetchJobsPageForSitemap(1);
  return [
    { id: 0 },
    ...Array.from({ length: totalPages }, (_, i) => ({ id: i + 1 })),
  ];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Number(await id);
  const lastModified = new Date();

  if (sitemapId === 0) {
    return staticPages.map(({ path, changeFrequency, priority }) => ({
      url: `${metaUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }));
  }

  const { jobs } = await fetchJobsPageForSitemap(sitemapId);

  return jobs
    .filter((job) => Boolean(jobHref(job)))
    .map((job) => ({
      url: `${metaUrl}${jobHref(job)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }));
}
