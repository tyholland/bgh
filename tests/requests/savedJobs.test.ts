import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedJob } from "@/types";
import { SaveJobInput } from "@/requests/savedJobs";

const load = async () => {
  vi.resetModules();
  return import("@/requests/savedJobs");
};

const idToken = "test-id-token";

const jobInput: SaveJobInput = {
  jobId: "abc123",
  roleName: "Backend Engineer",
  company: "Globex",
  link: "https://jobs.globex.example/backend-engineer",
};

const savedJob: SavedJob = {
  id: "saved-1",
  uid: "uid-1",
  jobId: "abc123",
  roleName: "Backend Engineer",
  company: "Globex",
  link: "https://jobs.globex.example/backend-engineer",
  createdAt: "2026-09-23T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createSavedJob", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { createSavedJob } = await load();

    await expect(createSavedJob(jobInput, idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("POSTs the job, authenticated with the id token", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => savedJob,
      } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { createSavedJob } = await load();
      const result = await createSavedJob(jobInput, idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-jobs");
      expect(init).toMatchObject({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      expect(JSON.parse(init.body)).toEqual(jobInput);
      expect(result).toEqual(savedJob);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response),
      );

      const { createSavedJob } = await load();
      await expect(createSavedJob(jobInput, idToken)).rejects.toThrow(/500/);
    });
  });
});

describe("getSavedJobs", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getSavedJobs } = await load();

    await expect(getSavedJobs(idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("GETs the list, authenticated with the id token", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ savedJobs: [savedJob] }),
      } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { getSavedJobs } = await load();
      const result = await getSavedJobs(idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-jobs");
      expect(init).toMatchObject({
        headers: { Authorization: `Bearer ${idToken}` },
      });
      expect(result).toEqual([savedJob]);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 401 } as Response),
      );

      const { getSavedJobs } = await load();
      await expect(getSavedJobs(idToken)).rejects.toThrow(/401/);
    });
  });
});

describe("deleteSavedJob", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { deleteSavedJob } = await load();

    await expect(deleteSavedJob("saved-1", idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("DELETEs the job by id, authenticated with the id token", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 204 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { deleteSavedJob } = await load();
      await deleteSavedJob("saved-1", idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-jobs/saved-1");
      expect(init).toMatchObject({
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response),
      );

      const { deleteSavedJob } = await load();
      await expect(deleteSavedJob("saved-1", idToken)).rejects.toThrow(/404/);
    });
  });
});
