import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedSearch, SavedSearchParams } from "@/types";

const load = async () => {
  vi.resetModules();
  return import("@/requests/savedSearches");
};

const idToken = "test-id-token";

const params: SavedSearchParams = {
  search: "engineer",
  company: "Acme",
};

const savedSearch: SavedSearch = {
  id: "search-1",
  uid: "uid-1",
  name: "Engineer roles",
  params,
  createdAt: "2026-09-23T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createSavedSearch", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { createSavedSearch } = await load();

    await expect(createSavedSearch(params, idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("POSTs the name and params, authenticated with the id token", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => savedSearch,
      } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { createSavedSearch } = await load();
      const result = await createSavedSearch(params, idToken, "Engineer roles");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-searches");
      expect(init).toMatchObject({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      expect(JSON.parse(init.body)).toEqual({ name: "Engineer roles", params });
      expect(result).toEqual(savedSearch);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response),
      );

      const { createSavedSearch } = await load();
      await expect(createSavedSearch(params, idToken)).rejects.toThrow(/500/);
    });
  });
});

describe("getSavedSearches", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getSavedSearches } = await load();

    await expect(getSavedSearches(idToken)).rejects.toThrow(
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
        json: async () => ({ savedSearches: [savedSearch] }),
      } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { getSavedSearches } = await load();
      const result = await getSavedSearches(idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-searches");
      expect(init).toMatchObject({
        headers: { Authorization: `Bearer ${idToken}` },
      });
      expect(result).toEqual([savedSearch]);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 401 } as Response),
      );

      const { getSavedSearches } = await load();
      await expect(getSavedSearches(idToken)).rejects.toThrow(/401/);
    });
  });
});

describe("deleteSavedSearch", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { deleteSavedSearch } = await load();

    await expect(deleteSavedSearch("search-1", idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("DELETEs the search by id, authenticated with the id token", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 204 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { deleteSavedSearch } = await load();
      await deleteSavedSearch("search-1", idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/saved-searches/search-1");
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

      const { deleteSavedSearch } = await load();
      await expect(deleteSavedSearch("search-1", idToken)).rejects.toThrow(
        /404/,
      );
    });
  });
});
