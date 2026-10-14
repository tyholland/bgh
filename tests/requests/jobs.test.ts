import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CsvData, Facet } from "@/types";

const load = async () => {
  vi.resetModules();
  return import("@/requests/jobs");
};

const job: CsvData = {
  "Role Name": "Senior Product Manager",
  "Primary Industry": "Technology",
  Scrape_DateTime: "2026-09-10 14:32:00",
  Scrape_Date: "2026/09/10",
  Company: "Acme Corp",
  Link: "https://careers.acme.com/jobs/123",
  id: "abc123",
};

const jobsApiBody = (jobs: CsvData[], overrides: Partial<Record<string, unknown>> = {}) => ({
  meta: { generatedAt: "2026-09-10T15:00:00.000Z", sourceScrapedAt: "2026-09-10T14:32:00.000Z" },
  jobs,
  total: jobs.length,
  totalPages: 1,
  page: 1,
  companies: [{ value: "Acme Corp", count: 1 }],
  industries: [{ value: "Technology", count: 1 }],
  scrapDates: ["2026/09/10"],
  ...overrides,
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getJobs", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getJobs } = await load();

    await expect(getJobs({})).rejects.toThrow(/NEXT_PUBLIC_API_BASE_URL/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("builds the query string from params and a default limit of 18", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: async () => jobsApiBody([job]) } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { getJobs } = await load();
      const result = await getJobs({ company: "Acme Corp", page: "2" });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/jobs?limit=18&company=Acme+Corp&page=2");
      expect(init).toMatchObject({ next: { tags: ["leads"], revalidate: 900 } });
      expect(result.data).toEqual([job]);
      expect(result.refreshedAt).toBe("2026-09-10T14:32:00.000Z");
    });

    it("honors an overridden limit", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: async () => jobsApiBody([]) } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { getJobs } = await load();
      await getJobs({}, 5);

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/jobs?limit=5");
    });

    it("throws on a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response),
      );

      const { getJobs } = await load();
      await expect(getJobs({})).rejects.toThrow(/500/);
    });
  });
});

describe("getJobById", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getJobById } = await load();

    await expect(getJobById("abc123")).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("GETs /v1/jobs/:id, url-encoding the id", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: async () => job } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { getJobById } = await load();
      const result = await getJobById("abc 123");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/jobs/abc%20123");
      expect(init).toMatchObject({ next: { tags: ["leads"], revalidate: 900 } });
      expect(result).toEqual(job);
    });

    it("returns null on a 404 instead of throwing", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response),
      );

      const { getJobById } = await load();
      await expect(getJobById("missing")).resolves.toBeNull();
    });

    it("throws on any other non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response),
      );

      const { getJobById } = await load();
      await expect(getJobById("abc123")).rejects.toThrow(/500/);
    });
  });
});

describe("getCompanies", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
  });

  it("fetches with limit=1 and returns the companies facet, sorted alphabetically", async () => {
    const companies: Facet[] = [
      { value: "Zeta Inc", count: 2 },
      { value: "Acme Corp", count: 5 },
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jobsApiBody([], { companies }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { getCompanies } = await load();
    const result = await getCompanies();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/v1/jobs?limit=1");
    expect(result).toEqual([
      { value: "Acme Corp", count: 5 },
      { value: "Zeta Inc", count: 2 },
    ]);
  });
});

describe("getSimilarJobs", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
  });

  it("returns [] without fetching when the job has no industry", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getSimilarJobs } = await load();
    const result = await getSimilarJobs({ ...job, "Primary Industry": "" });

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("queries by the job's industry and excludes the job itself", async () => {
    const other: CsvData = { ...job, Link: "https://careers.acme.com/jobs/456", id: "other" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jobsApiBody([job, other]),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { getSimilarJobs } = await load();
    const result = await getSimilarJobs(job, 4);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/v1/jobs?limit=5&industry=Technology&sort=most");
    expect(result).toEqual([other]);
  });

  it("returns [] instead of throwing when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response),
    );

    const { getSimilarJobs } = await load();
    await expect(getSimilarJobs(job)).resolves.toEqual([]);
  });
});
