import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => {
  vi.resetModules();
  return import("@/functions/stripeCheckout");
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getStripeCheckoutUrl", () => {
  it("returns null when NEXT_PUBLIC_STRIPE_PAYMENT_LINK is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PAYMENT_LINK", "");
    const { getStripeCheckoutUrl } = await load();

    expect(getStripeCheckoutUrl("uid-1", "jo@example.com")).toBeNull();
  });

  it("appends client_reference_id and prefilled_email to the payment link", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_STRIPE_PAYMENT_LINK",
      "https://buy.stripe.com/test_abc123",
    );
    const { getStripeCheckoutUrl } = await load();

    const url = getStripeCheckoutUrl("uid-1", "jo@example.com");

    expect(url).not.toBeNull();
    const parsed = new URL(url!);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://buy.stripe.com/test_abc123",
    );
    expect(parsed.searchParams.get("client_reference_id")).toBe("uid-1");
    expect(parsed.searchParams.get("prefilled_email")).toBe(
      "jo@example.com",
    );
  });

  it("omits prefilled_email when no email is given", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_STRIPE_PAYMENT_LINK",
      "https://buy.stripe.com/test_abc123",
    );
    const { getStripeCheckoutUrl } = await load();

    const url = getStripeCheckoutUrl("uid-1", null);

    const parsed = new URL(url!);
    expect(parsed.searchParams.has("prefilled_email")).toBe(false);
    expect(parsed.searchParams.get("client_reference_id")).toBe("uid-1");
  });

  it("preserves existing query params already on the payment link", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_STRIPE_PAYMENT_LINK",
      "https://buy.stripe.com/test_abc123?prefilled_promo_code=TRIAL7",
    );
    const { getStripeCheckoutUrl } = await load();

    const url = getStripeCheckoutUrl("uid-1", "jo@example.com");

    const parsed = new URL(url!);
    expect(parsed.searchParams.get("prefilled_promo_code")).toBe("TRIAL7");
    expect(parsed.searchParams.get("client_reference_id")).toBe("uid-1");
  });
});
