import { SubscriptionStatus } from "@/types";

// "trialing" and "active" are the only statuses that unblock gated
// features — "none" (never checked out), "past_due", and "canceled" all
// still block, same as a signed-out visitor. `null` covers a signed-out
// user and the brief window before subscriptionStatusAtom has loaded.
export const hasActiveAccess = (
  status: SubscriptionStatus | null,
): boolean => status === "trialing" || status === "active";
