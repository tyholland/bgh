import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const revalidateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

const load = async () => {
  vi.resetModules();
  return import("@/app/api/revalidate/route");
};

const makeRequest = (authorization?: string) =>
  new NextRequest("https://example.com/api/revalidate", {
    method: "POST",
    headers: authorization ? { authorization } : undefined,
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/revalidate", () => {
  it("rejects when REVALIDATE_SECRET is not configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const { POST } = await load();

    const res = await POST(makeRequest("Bearer whatever"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ revalidated: false });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("rejects when the bearer token doesn't match the secret", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret");
    const { POST } = await load();

    const res = await POST(makeRequest("Bearer wrong"));

    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("rejects when no authorization header is sent", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret");
    const { POST } = await load();

    const res = await POST(makeRequest());

    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("revalidates the leads tag when the bearer token matches", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret");
    const { POST } = await load();

    const res = await POST(makeRequest("Bearer top-secret"));

    expect(res.status).toBe(200);
    // "max" would serve stale content while revalidating in the background —
    // wrong for a webhook that needs the next request to see fresh data
    // immediately (see src/app/api/revalidate/route.ts).
    expect(revalidateTagMock).toHaveBeenCalledWith("leads", { expire: 0 });

    const body = await res.json();
    expect(body.revalidated).toBe(true);
    expect(typeof body.now).toBe("number");
  });
});
