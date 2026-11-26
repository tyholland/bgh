import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const load = async () => {
  vi.resetModules();
  return import("@/requests/stripeCheckout");
};

const idToken = "test-id-token";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("syncCheckoutSession", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { syncCheckoutSession } = await load();

    await expect(syncCheckoutSession("cs_1", idToken)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("GETs the checkout session endpoint, authenticated with the id token", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { syncCheckoutSession } = await load();
      await syncCheckoutSession("cs_1", idToken);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.test/v1/stripe/checkout-session/cs_1",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
    });

    it("throws when the API responds with a non-ok status", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: false, status: 403 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { syncCheckoutSession } = await load();

      await expect(syncCheckoutSession("cs_1", idToken)).rejects.toThrow(
        /403/,
      );
    });
  });
});
