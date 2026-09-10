import { User } from "@/types";

const STORAGE_KEY = "bgh.user";

const isStoredUser = (value: unknown): value is User =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { uid?: unknown }).uid === "string";

// Reads the cached session. Never throws — a corrupt or absent value yields null.
export const readStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isStoredUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeStoredUser = (user: User) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable — the auth listener still holds state in memory */
  }
};

export const clearStoredUser = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
