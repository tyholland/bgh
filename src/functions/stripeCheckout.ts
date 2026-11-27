// Builds the Stripe Payment Link URL for starting a trial, tagged with
// `client_reference_id` (our Firebase uid) so the backend's webhook handler
// (bgh_node's src/routes/stripeWebhook.ts) can link the resulting Stripe
// customer back to this account on checkout.session.completed. Stripe
// Payment Links forward both query params into the Checkout Session
// untouched — no API call needed to set them.
export const getStripeCheckoutUrl = (
  uid: string,
  email?: string | null,
): string | null => {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  if (!paymentLink) return null;

  const url = new URL(paymentLink);
  url.searchParams.set("client_reference_id", uid);
  if (email) url.searchParams.set("prefilled_email", email);

  return url.toString();
};
