import { SavedSearch, SavedSearchParams } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Saves the given search/filter criteria for the signed-in user. `idToken`
 * authenticates the caller — the API scopes the row to the token's uid.
 */
export const createSavedSearch = async (
  params: SavedSearchParams,
  idToken: string,
  name?: string
): Promise<SavedSearch> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot save search.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-searches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ name, params }),
  });

  if (!res.ok) {
    throw new Error(`Create saved search API responded with ${res.status}`);
  }

  return res.json();
};

/**
 * Lists the signed-in user's saved searches.
 */
export const getSavedSearches = async (idToken: string): Promise<SavedSearch[]> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot list saved searches.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-searches`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`List saved searches API responded with ${res.status}`);
  }

  const { savedSearches } = await res.json();
  return savedSearches;
};

/**
 * Deletes one of the signed-in user's saved searches. The API rejects the
 * request if `id` isn't owned by the token's uid.
 */
export const deleteSavedSearch = async (id: string, idToken: string): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot delete saved search.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-searches/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Delete saved search API responded with ${res.status}`);
  }
};
