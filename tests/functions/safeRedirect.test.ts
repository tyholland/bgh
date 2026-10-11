import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "@/functions/safeRedirect";

describe("getSafeRedirect", () => {
  it("passes through a same-site path", () => {
    expect(getSafeRedirect("/jobs/backend-engineer")).toBe(
      "/jobs/backend-engineer",
    );
  });

  it("preserves a query string on the path", () => {
    expect(getSafeRedirect("/?page=2&sort=a")).toBe("/?page=2&sort=a");
  });

  it("falls back to / when there is nothing to redirect to", () => {
    expect(getSafeRedirect(null)).toBe("/");
    expect(getSafeRedirect(undefined)).toBe("/");
    expect(getSafeRedirect("")).toBe("/");
  });

  it("rejects an absolute URL to avoid an open redirect", () => {
    expect(getSafeRedirect("https://evil.example.com")).toBe("/");
  });

  it("rejects a protocol-relative URL to avoid an open redirect", () => {
    expect(getSafeRedirect("//evil.example.com")).toBe("/");
  });

  it("rejects a path with no leading slash", () => {
    expect(getSafeRedirect("jobs/backend-engineer")).toBe("/");
  });
});
