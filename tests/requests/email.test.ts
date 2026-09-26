import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const load = async () => {
  vi.resetModules();
  return import("@/requests/email");
};

const payload = {
  kind: "feedback" as const,
  firstName: "Jo",
  lastName: "Rivera",
  email: "jo@example.com",
  message: "Nice site",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("sendContactMessage", () => {
  it("throws when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { sendContactMessage } = await load();

    await expect(sendContactMessage(payload)).rejects.toThrow(
      /NEXT_PUBLIC_API_BASE_URL/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a configured base URL", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    });

    it("POSTs the payload as JSON to /v1/contact", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 202 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { sendContactMessage } = await load();
      await sendContactMessage(payload);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.test/v1/contact");
      expect(init).toMatchObject({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      expect(JSON.parse(init.body)).toEqual(payload);
    });

    it("never includes a client-controlled recipient", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, status: 202 } as Response);
      vi.stubGlobal("fetch", fetchMock);

      const { sendContactMessage } = await load();
      await sendContactMessage(payload);

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).not.toHaveProperty("to");
      expect(body).not.toHaveProperty("recipient");
    });

    it("throws when the API responds with a non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 429 } as Response),
      );

      const { sendContactMessage } = await load();
      await expect(sendContactMessage(payload)).rejects.toThrow(/429/);
    });

    it("resolves when the API responds OK", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, status: 202 } as Response),
      );

      const { sendContactMessage } = await load();
      await expect(sendContactMessage(payload)).resolves.toBeUndefined();
    });
  });
});
