const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Links the Stripe customer from a just-completed Checkout Session to this
 * account and updates its subscription status, synchronously — the same
 * effect as the checkout.session.completed webhook, but immediate, so the
 * account reflects the new subscription as soon as Stripe's Payment Link
 * redirects back here (see stripeCheckout.ts's getStripeCheckoutUrl and
 * bgh_node's GET /v1/stripe/checkout-session/:sessionId). `idToken` must
 * belong to the uid that started the checkout.
 */
export const syncCheckoutSession = async (
  sessionId: string,
  idToken: string,
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — cannot sync checkout session.",
    );
  }

  const res = await fetch(
    `${API_BASE_URL}/v1/stripe/checkout-session/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Sync checkout session API responded with ${res.status}`);
  }
};
