"use client";

import { useAtomValue } from "jotai";
import * as S from "./subscription-status.style";
import { userAtom } from "@/caches/UserAtom";
import { subscriptionStatusAtom } from "@/caches/SubscriptionAtom";
import { getStripeCheckoutUrl } from "@/functions/stripeCheckout";
import { trackEvent } from "@/functions/mixpanel";
import { useHasMounted } from "@/functions/useHasMounted";

const STATUS_COPY: Record<string, string> = {
  none: "You haven't started your free trial yet.",
  trialing: "You're on your free trial.",
  active: "Your subscription is active.",
  past_due: "Your last payment failed — please update your payment method.",
  canceled: "Your subscription has been canceled.",
};

const SubscriptionStatus = () => {
  const rawUser = useAtomValue(userAtom);
  // Same mount-gating as the rest of the account page — userAtom can already
  // hold a cached-session user before this component's first client render.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  // Populated by authProvider.tsx right after sign-in — reading the shared
  // atom here instead of a second fetch via getUser().
  const status = useAtomValue(subscriptionStatusAtom);

  if (!user) return null;

  const showStartTrial = status === "none" || status === "canceled" || status === "past_due";

  const handleStartTrial = () => {
    const checkoutUrl = getStripeCheckoutUrl(user.uid, user.email);
    if (!checkoutUrl) return;

    trackEvent(user, "Start Free Trial", { type: "button", from: "account" });
    window.location.href = checkoutUrl;
  };

  return (
    <S.Wrapper>
      <div>{STATUS_COPY[status ?? "none"]}</div>
      {showStartTrial && (
        <button type="button" onClick={handleStartTrial}>
          {status === "none" ? "Start Free Trial" : "Restart Subscription"}
        </button>
      )}
    </S.Wrapper>
  );
};

export default SubscriptionStatus;
