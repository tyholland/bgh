import { atom } from "jotai";
import { SubscriptionStatus } from "../types";

// Populated by authProvider.tsx right after userAtom, from the API's
// GET /v1/users/:uid — not part of `User`/`userAtom` itself, same reasoning
// as emailNotifications/jobTitle: it's backend-only state with no Firebase
// equivalent. null means "signed out" or "not loaded yet"; see
// functions/subscription.ts's hasActiveAccess for how gating treats that.
export const subscriptionStatusAtom = atom<SubscriptionStatus | null>(null);
