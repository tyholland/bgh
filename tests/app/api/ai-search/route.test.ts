import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Facet } from "@/types";

const getJobsMock = vi.hoisted(() => vi.fn());

vi.mock("@/requests/jobs", () => ({ getJobs: getJobsMock }));

const load = async () => {
  vi.resetModules();
  return import("@/app/api/ai-search/route");
};

const makeRequest = (body?: unknown) =>
  new NextRequest("https://example.com/api/ai-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const companies: Facet[] = [{ value: "Acme Corp", count: 5 }];
const industries: Facet[] = [{ value: "Technology", count: 10 }];

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/ai-search", () => {
  it("rejects an empty query", async () => {
    const { POST } = await load();

    const res = await POST(makeRequest({ query: "   " }));

    expect(res.status).toBe(400);
    expect(getJobsMock).not.toHaveBeenCalled();
  });

  it("rejects a query over the length limit", async () => {
    const { POST } = await load();

    const res = await POST(makeRequest({ query: "a".repeat(401) }));

    expect(res.status).toBe(400);
    expect(getJobsMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid request body", async () => {
    const { POST } = await load();

    const res = await POST(
      new NextRequest("https://example.com/api/ai-search", {
        method: "POST",
        body: "not json",
      }),
    );

    expect(res.status).toBe(400);
  });

  it("returns 502 when the facet lookup fails", async () => {
    getJobsMock.mockRejectedValue(new Error("boom"));
    const { POST } = await load();

    const res = await POST(makeRequest({ query: "remote React jobs" }));

    expect(res.status).toBe(502);
  });

  it("extracts filters from the query and matches known facets", async () => {
    getJobsMock.mockResolvedValue({ companies, industries });
    const { POST } = await load();

    const res = await POST(
      makeRequest({
        query:
          "Remote senior UI developer at Acme Corp in Technology using React, pay at least $100k, posted in the last week",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.params.search).toContain("Senior");
    expect(body.params.search).toContain("developer");
    expect(body.params.keyword).toContain("Remote");
    expect(body.params.keyword).toContain("React");
    expect(body.params.company).toBe("Acme Corp");
    expect(body.params.industry).toBe("Technology");
    expect(typeof body.params.date).toBe("string");
    expect(body.notes).toEqual([
      "Pay isn't filtered — job listings don't include salary data.",
    ]);
    expect(getJobsMock).toHaveBeenCalledWith({}, 1);
  });

  it("adds a fallback note when nothing in the query mapped to a filter", async () => {
    getJobsMock.mockResolvedValue({ companies, industries });
    const { POST } = await load();

    const res = await POST(makeRequest({ query: "the and of" }));
    const body = await res.json();

    expect(body.params).toEqual({});
    expect(body.notes).toEqual([
      "We couldn't match any filters to that request — showing all jobs.",
    ]);
  });
});
