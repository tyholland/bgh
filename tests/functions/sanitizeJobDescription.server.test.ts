import { describe, expect, it } from "vitest";
import { sanitizeJobDescriptionServer } from "@/functions/sanitizeJobDescription.server";

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
});
