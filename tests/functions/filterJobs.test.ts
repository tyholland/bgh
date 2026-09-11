import { describe, expect, it } from "vitest";
import { filterJobs, JOBS_PER_PAGE } from "@/functions/filterJobs";
import { CsvData } from "@/types";

let counter = 0;

const job = (over: Partial<CsvData> = {}): CsvData => ({
  "Role Name": "Software Engineer",
  "Primary Industry": "Technology",
  Scrape_DateTime: "2026-09-10 09:00:00",
  Scrape_Date: "2026/09/10",
  Company: "Acme",
  Link: `https://jobs.example.com/${counter++}`,
  ...over,
});

const roles = (data: CsvData[]) => data.map((d) => d["Role Name"]);

describe("filterJobs", () => {
  describe("empty input", () => {
    it("returns an empty, well-formed payload", () => {
      expect(filterJobs([], {})).toEqual({
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
        refreshedAt: "",
        scrapDates: [],
        companies: [],
        industries: [],
      });
    });
  });

  describe("refreshedAt", () => {
    it("is the newest Scrape_DateTime across all rows, before filtering", () => {
      const rows = [
        job({ Scrape_DateTime: "2026-09-01 09:00:00", Company: "Old" }),
        job({ Scrape_DateTime: "2026-09-10 18:30:00", Company: "New" }),
        job({ Scrape_DateTime: "2026-09-05 12:00:00", Company: "Mid" }),
      ];

      // even when a filter removes the newest row
      expect(filterJobs(rows, { company: "Old" }).refreshedAt).toBe(
        "2026-09-10 18:30:00",
      );
    });

    it("tolerates missing timestamps", () => {
      const rows = [
        job({ Scrape_DateTime: "" }),
        job({ Scrape_DateTime: "2026-09-09 08:00:00" }),
      ];
      expect(filterJobs(rows, {}).refreshedAt).toBe("2026-09-09 08:00:00");
    });
  });

  describe("sorting", () => {
    const rows = [
      job({ "Role Name": "Beta", Scrape_DateTime: "2026-09-02 09:00:00" }),
      job({ "Role Name": "Alpha", Scrape_DateTime: "2026-09-03 09:00:00" }),
      job({ "Role Name": "Gamma", Scrape_DateTime: "2026-09-01 09:00:00" }),
    ];

    it("defaults to most-recent first", () => {
      expect(roles(filterJobs(rows, {}).data)).toEqual([
        "Alpha",
        "Beta",
        "Gamma",
      ]);
    });

    it("sort=most is explicit newest first", () => {
      expect(roles(filterJobs(rows, { sort: "most" }).data)).toEqual([
        "Alpha",
        "Beta",
        "Gamma",
      ]);
    });

    it("sort=least is oldest first", () => {
      expect(roles(filterJobs(rows, { sort: "least" }).data)).toEqual([
        "Gamma",
        "Beta",
        "Alpha",
      ]);
    });

    it("sort=a is A→Z by role name", () => {
      expect(roles(filterJobs(rows, { sort: "a" }).data)).toEqual([
        "Alpha",
        "Beta",
        "Gamma",
      ]);
    });

    it("sort=z is Z→A by role name", () => {
      expect(roles(filterJobs(rows, { sort: "z" }).data)).toEqual([
        "Gamma",
        "Beta",
        "Alpha",
      ]);
    });

    it("an unknown sort value falls back to most-recent", () => {
      expect(roles(filterJobs(rows, { sort: "nonsense" }).data)).toEqual([
        "Alpha",
        "Beta",
        "Gamma",
      ]);
    });
  });

  describe("search", () => {
    const rows = [
      job({ "Role Name": "Senior Software Engineer" }),
      job({ "Role Name": "Product Manager" }),
      job({ "Role Name": "Engineering Manager" }),
    ];

    it("matches a case-insensitive substring of the role name", () => {
      expect(roles(filterJobs(rows, { search: "ENGINEER" }).data).sort()).toEqual(
        ["Engineering Manager", "Senior Software Engineer"],
      );
    });

    it("returns nothing when there is no match", () => {
      expect(filterJobs(rows, { search: "designer" }).total).toBe(0);
    });

    it("ignores surrounding whitespace", () => {
      expect(filterJobs(rows, { search: "  product " }).total).toBe(1);
    });
  });

  describe("company / industry filters", () => {
    const rows = [
      job({ Company: "Acme", "Primary Industry": "Technology" }),
      job({ Company: "Globex", "Primary Industry": "Finance" }),
      job({ Company: "Initech", "Primary Industry": "Technology" }),
    ];

    it("company matches exactly, case-insensitively", () => {
      const out = filterJobs(rows, { company: "acme" });
      expect(out.total).toBe(1);
      expect(out.data[0].Company).toBe("Acme");
    });

    it("company accepts a comma-separated list", () => {
      const out = filterJobs(rows, { company: "Acme, Globex" });
      expect(out.total).toBe(2);
    });

    it("industry matches exactly, case-insensitively", () => {
      expect(filterJobs(rows, { industry: "technology" }).total).toBe(2);
    });

    it("company and industry combine (AND)", () => {
      const out = filterJobs(rows, {
        company: "Acme,Initech",
        industry: "Finance",
      });
      expect(out.total).toBe(0);
    });
  });

  describe("keyword filter", () => {
    const rows = [
      job({ "Role Name": "Senior Engineer" }),
      job({ "Role Name": "Staff Engineer" }),
      job({ "Role Name": "Junior Engineer" }),
    ];

    it("matches any of a comma-separated list against the role name", () => {
      const out = filterJobs(rows, { keyword: "senior,staff" });
      expect(roles(out.data).sort()).toEqual([
        "Senior Engineer",
        "Staff Engineer",
      ]);
    });
  });

  describe("date filters", () => {
    const rows = [
      job({ Scrape_Date: "2026/09/05", "Role Name": "Old" }),
      job({ Scrape_Date: "2026/09/08", "Role Name": "Mid" }),
      job({ Scrape_Date: "2026/09/10", "Role Name": "New" }),
    ];

    it("exact matches a single Scrape_Date (dash or slash separated input)", () => {
      expect(roles(filterJobs(rows, { exact: "2026-09-08" }).data)).toEqual([
        "Mid",
      ]);
      expect(roles(filterJobs(rows, { exact: "2026/09/08" }).data)).toEqual([
        "Mid",
      ]);
    });

    it("date keeps rows on or after the given day", () => {
      expect(roles(filterJobs(rows, { date: "2026-09-08" }).data).sort()).toEqual(
        ["Mid", "New"],
      );
    });

    it("exact wins when both date and exact are present", () => {
      const out = filterJobs(rows, { date: "2026-09-01", exact: "2026-09-10" });
      expect(roles(out.data)).toEqual(["New"]);
    });

    it("an unparseable date value is ignored rather than dropping everything", () => {
      expect(filterJobs(rows, { date: "not-a-date" }).total).toBe(3);
    });
  });

  describe("facets", () => {
    const rows = [
      job({ Company: "Acme", "Primary Industry": "Technology" }),
      job({ Company: "Acme", "Primary Industry": "Technology" }),
      job({ Company: "Globex", "Primary Industry": "Finance" }),
    ];

    it("returns {value, count} sorted by value", () => {
      const out = filterJobs(rows, {});
      expect(out.companies).toEqual([
        { value: "Acme", count: 2 },
        { value: "Globex", count: 1 },
      ]);
      expect(out.industries).toEqual([
        { value: "Finance", count: 1 },
        { value: "Technology", count: 2 },
      ]);
    });

    it("facet counts reflect the search/keyword/date filters", () => {
      const searchRows = [
        job({ Company: "Acme", "Role Name": "Engineer" }),
        job({ Company: "Acme", "Role Name": "Designer" }),
      ];
      const out = filterJobs(searchRows, { search: "engineer" });
      expect(out.companies).toEqual([{ value: "Acme", count: 1 }]);
    });

    it("facets ignore the company/industry selection so both lists stay usable", () => {
      const out = filterJobs(rows, { company: "Acme" });
      // results are Acme-only...
      expect(out.total).toBe(2);
      // ...but the industry facet still shows Globex's industry
      expect(out.industries.map((f) => f.value)).toEqual([
        "Finance",
        "Technology",
      ]);
      expect(out.companies.map((f) => f.value)).toEqual(["Acme", "Globex"]);
    });

    it("scrapDates are unique and sorted newest first", () => {
      const dateRows = [
        job({ Scrape_Date: "2026/09/01" }),
        job({ Scrape_Date: "2026/09/10" }),
        job({ Scrape_Date: "2026/09/10" }),
        job({ Scrape_Date: "2026/09/05" }),
      ];
      expect(filterJobs(dateRows, {}).scrapDates).toEqual([
        "2026/09/10",
        "2026/09/05",
        "2026/09/01",
      ]);
    });
  });

  describe("pagination", () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      job({
        "Role Name": `Role ${String(i).padStart(2, "0")}`,
        Scrape_DateTime: `2026-09-10 09:${String(i).padStart(2, "0")}:00`,
      }),
    );

    it("returns one page and the right totals", () => {
      const out = filterJobs(many, {});
      expect(out.data).toHaveLength(JOBS_PER_PAGE);
      expect(out.total).toBe(40);
      expect(out.totalPages).toBe(3);
      expect(out.page).toBe(1);
    });

    it("slices the requested page", () => {
      const page1 = filterJobs(many, { page: "1" }).data;
      const page2 = filterJobs(many, { page: "2" }).data;
      expect(page2).toHaveLength(JOBS_PER_PAGE);
      expect(page2[0].Link).not.toBe(page1[0].Link);
    });

    it("clamps a page past the end to the last page", () => {
      const out = filterJobs(many, { page: "99" });
      expect(out.page).toBe(3);
      expect(out.data).toHaveLength(40 - 2 * JOBS_PER_PAGE);
    });

    it("treats a missing or junk page as page 1", () => {
      expect(filterJobs(many, { page: "0" }).page).toBe(1);
      expect(filterJobs(many, { page: "abc" }).page).toBe(1);
      expect(filterJobs(many, {}).page).toBe(1);
    });
  });

  describe("resilience", () => {
    it("does not mutate the input array order", () => {
      const rows = [
        job({ "Role Name": "B", Scrape_DateTime: "2026-09-01 09:00:00" }),
        job({ "Role Name": "A", Scrape_DateTime: "2026-09-02 09:00:00" }),
      ];
      const snapshot = rows.map((r) => r["Role Name"]);
      filterJobs(rows, { sort: "a" });
      expect(rows.map((r) => r["Role Name"])).toEqual(snapshot);
    });

    it("tolerates rows with missing role / company / industry", () => {
      const rows = [
        job({ "Role Name": "", Company: "", "Primary Industry": "" }),
        job(),
      ];
      expect(() => filterJobs(rows, { search: "x", sort: "a" })).not.toThrow();
    });
  });
});
