import { describe, expect, it } from "vitest";
import { hasActiveAccess } from "@/functions/subscription";

describe("hasActiveAccess", () => {
  it("grants access for trialing and active", () => {
    expect(hasActiveAccess("trialing")).toBe(true);
    expect(hasActiveAccess("active")).toBe(true);
  });

  it("blocks none, past_due, canceled, and null", () => {
    expect(hasActiveAccess("none")).toBe(false);
    expect(hasActiveAccess("past_due")).toBe(false);
    expect(hasActiveAccess("canceled")).toBe(false);
    expect(hasActiveAccess(null)).toBe(false);
  });
});
