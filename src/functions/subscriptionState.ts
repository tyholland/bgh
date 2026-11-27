import { SubscriptionStatus } from "@/types";

const STORAGE_KEY = "bgh.subscriptionStatus";

const VALID_STATUSES: readonly SubscriptionStatus[] = [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
];

const isSubscriptionStatus = (value: unknown): value is SubscriptionStatus =>
  typeof value === "string" &&
  (VALID_STATUSES as readonly string[]).includes(value);

// Same reasoning as userState.ts's readStoredUser/writeStoredUser — a fresh
// page load (full navigation, not a client-side route change) remounts
// authProvider.tsx from scratch, and its GET /v1/users/:uid fetch takes a
// moment. Without this cache, hasActiveAccess() would read the atom's null
// default during that window and treat an already-subscribed user as
// blocked, every single page load. Never throws — a corrupt or absent value
// yields null, same as "not loaded yet".
export const readStoredSubscriptionStatus = (): SubscriptionStatus | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isSubscriptionStatus(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeStoredSubscriptionStatus = (status: SubscriptionStatus) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {
    /* storage unavailable — the atom still holds state in memory */
  }
};

export const clearStoredSubscriptionStatus = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
