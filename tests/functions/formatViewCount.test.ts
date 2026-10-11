import { describe, expect, it } from "vitest";
import { formatViewCount } from "@/functions/formatViewCount";

describe("formatViewCount", () => {
  it("uses singular wording for exactly one view", () => {
    expect(formatViewCount(1)).toBe("Viewed by 1 job seeker");
  });

  it("uses plural wording for any other count", () => {
    expect(formatViewCount(0)).toBe("Viewed by 0 job seekers");
    expect(formatViewCount(42)).toBe("Viewed by 42 job seekers");
  });
});
