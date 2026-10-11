import { describe, expect, it } from "vitest";
import {
  sanitizeJobDescriptionServer,
  stripAllTags,
} from "@/functions/sanitizeJobDescription.server";

describe("sanitizeJobDescriptionServer", () => {
  it("returns an empty string for undefined input", () => {
    expect(sanitizeJobDescriptionServer(undefined)).toBe("");
  });

  it("keeps allow-listed tags and attributes", () => {
    const html = "<p>Great role at <strong>Acme</strong>. <a href=\"https://acme.com\">Learn more</a></p>";
    expect(sanitizeJobDescriptionServer(html)).toBe(html);
  });

  it("strips disallowed tags and attributes, same allow-list as the client sanitizer", () => {
    const html =
      '<p onclick="alert(1)">Hi</p><script>alert(1)</script><img src="x" />';
    const clean = sanitizeJobDescriptionServer(html);

    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("<img");
    expect(clean).toContain("<p>Hi</p>");
  });

  // getSanitize() falls back to stripAllTags when jsdom/DOMPurify fail to
  // `require` (see that module's comments — this has happened for real on
  // Vercel). That failure can't be simulated here: it's a lazily-called
  // `require`, and Vitest's module mocking only intercepts `import`
  // (confirmed — mocking "jsdom" has no effect on a `require("jsdom")` call
  // made from inside the module under test). So this tests the exported
  // fallback function directly, on its own merits, rather than the
  // unreachable-in-tests wiring that selects it.
  describe("stripAllTags (the fallback used when jsdom/DOMPurify can't load)", () => {
    it("removes allow-listed tags along with everything else", () => {
      const html = "<p>Great role at <strong>Acme</strong></p>";
      expect(stripAllTags(html)).toBe("Great role at Acme");
    });

    it("removes disallowed tags and any attributes on them", () => {
      const html = '<p onclick="alert(1)">Hi</p><script>alert(1)</script><img src="x" />';
      expect(stripAllTags(html)).toBe("Hialert(1)");
    });

    it("leaves plain text untouched", () => {
      expect(stripAllTags("Just plain text, no markup.")).toBe(
        "Just plain text, no markup.",
      );
    });
  });
});
