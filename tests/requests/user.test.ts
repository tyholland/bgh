import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";

const load = async () => {
  vi.resetModules();
  return import("@/requests/user");
};

const idToken = "test-id-token";

const user: User = {
  uid: "uid-1",
  email: "jo@example.com",
  displayName: "Jo Rivera",
  phoneNumber: null,
  photoURL: null,
  providerId: "password",
};

const expectedPayload = {
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  phoneNumber: user.phoneNumber,
  photoURL: user.photoURL,
  providerId: user.providerId,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createUser", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { createUser } = await load();

    await expect(createUser(user, idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("POSTs the profile payload, authenticated with the id token", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 201 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { createUser } = await load();
      await createUser(user, idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/users");
      expect(init).toMatchObject({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      expect(JSON.parse(init.body)).toEqual(expectedPayload);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 409 } as Response),
      );

      const { createUser } = await load();
      await expect(createUser(user, idToken)).rejects.toThrow(/409/);
    });
  });
});

describe("updateUser", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { updateUser } = await load();

    await expect(updateUser(user, idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("PATCHes the profile payload to the user's uid, authenticated with the id token", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { updateUser } = await load();
      await updateUser(user, idToken);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`https://api.test/v1/users/${user.uid}`);
      expect(init).toMatchObject({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      expect(JSON.parse(init.body)).toEqual(expectedPayload);
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 403 } as Response),
      );

      const { updateUser } = await load();
      await expect(updateUser(user, idToken)).rejects.toThrow(/403/);
    });
  });
});
