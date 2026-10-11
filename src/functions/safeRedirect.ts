/**
 * Guards the `redirect` query param against open-redirect abuse — only a
 * same-site path ("/jobs?x=1") is allowed; anything else (an absolute URL,
 * a protocol-relative "//evil.com") falls back to the home page.
 */
export const getSafeRedirect = (value: string | null | undefined): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
};
