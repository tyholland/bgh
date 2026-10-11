import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CsvData } from "@/types";

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

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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
