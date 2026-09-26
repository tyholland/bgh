// A minimal stand-in for the (not-yet-built) BGH Scout API, used only for
// e2e tests. `src/app/page.tsx` fetches `/v1/jobs` from a Node *server*
// component, so Playwright's page.route() can't intercept it — this process
// is the only way to control that response. Started by Playwright's
// `webServer` config (see playwright.config.ts).
import { createServer } from "node:http";
import { JOBS } from "./jobs-data.mjs";

const PORT = Number(process.env.MOCK_API_PORT) || 4310;

const matchesFacet = (value, param) => {
  if (!param) return true;
  const wanted = param.split(",").filter(Boolean);
  return wanted.length === 0 || wanted.includes(value);
};

const applyFilters = (jobs, params) => {
  let result = jobs;

  const search = params.get("search");
  if (search) {
    const needle = search.toLowerCase();
    result = result.filter((job) =>
      `${job["Role Name"]} ${job.Company} ${job["Primary Industry"]}`
        .toLowerCase()
        .includes(needle),
    );
  }

  const keyword = params.get("keyword");
  if (keyword) {
    const needles = keyword
      .split(",")
      .filter(Boolean)
      .map((entry) => entry.toLowerCase());
    result = result.filter((job) => {
      const haystack =
        `${job["Role Name"]} ${job.Company} ${job["Primary Industry"]}`.toLowerCase();
      return needles.every((needle) => haystack.includes(needle));
    });
  }

  result = result.filter(
    (job) =>
      matchesFacet(job.Company, params.get("company")) &&
      matchesFacet(job["Primary Industry"], params.get("industry")),
  );

  const exact = params.get("exact");
  if (exact) {
    result = result.filter((job) => job.Scrape_Date === exact);
  }

  const date = params.get("date");
  if (date) {
    result = result.filter((job) => job.Scrape_Date >= date);
  }

  return result;
};

const sortJobs = (jobs, sort) => {
  const sorted = [...jobs];

  switch (sort) {
    case "a":
      return sorted.sort((a, b) => a["Role Name"].localeCompare(b["Role Name"]));
    case "z":
      return sorted.sort((a, b) => b["Role Name"].localeCompare(a["Role Name"]));
    case "least":
      return sorted.sort(
        (a, b) => new Date(a.Scrape_DateTime) - new Date(b.Scrape_DateTime),
      );
    case "most":
    default:
      return sorted.sort(
        (a, b) => new Date(b.Scrape_DateTime) - new Date(a.Scrape_DateTime),
      );
  }
};

const facetCounts = (jobs, key) => {
  const counts = new Map();
  for (const job of jobs) {
    counts.set(job[key], (counts.get(job[key]) ?? 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({ value, count }));
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/v1/jobs") {
    const params = url.searchParams;
    const limit = Number(params.get("limit")) || 18;
    const page = Number(params.get("page")) || 1;

    const filtered = sortJobs(applyFilters(JOBS, params), params.get("sort"));
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageJobs = filtered.slice(start, start + limit);

    const body = {
      meta: {
        generatedAt: new Date().toISOString(),
        sourceScrapedAt: "2026-09-20T12:00:00.000Z",
      },
      jobs: pageJobs,
      total,
      totalPages,
      page,
      companies: facetCounts(JOBS, "Company"),
      industries: facetCounts(JOBS, "Primary Industry"),
      scrapDates: [...new Set(JOBS.map((job) => job.Scrape_Date))].sort(),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock BGH Scout API listening on http://127.0.0.1:${PORT}`);
});
