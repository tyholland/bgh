import { SavedJob, SavedJobAlertFrequency } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface SaveJobInput {
  jobId: string;
  roleName: string;
  company: string | null;
  link: string;
}

/**
 * Bookmarks the given job for the signed-in user. `idToken` authenticates
 * the caller — the API scopes the row to the token's uid. Idempotent on the
 * API side: saving an already-saved job returns the existing record.
 */
export const createSavedJob = async (
  job: SaveJobInput,
  idToken: string,
): Promise<SavedJob> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot save job.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(job),
  });

  if (!res.ok) {
    throw new Error(`Create saved job API responded with ${res.status}`);
  }

  return res.json();
};

/**
 * Lists the signed-in user's saved jobs.
 */
export const getSavedJobs = async (idToken: string): Promise<SavedJob[]> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot list saved jobs.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-jobs`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`List saved jobs API responded with ${res.status}`);
  }

  const { savedJobs } = await res.json();
  return savedJobs;
};

/**
 * Changes a saved job's alert frequency (the only field editable after
 * creation today — role/company/link still require delete-and-resave).
 * Used by the inline frequency picker in
 * src/components/saved-jobs/saved-jobs.tsx.
 */
export const updateSavedJob = async (
  id: string,
  alertFrequency: SavedJobAlertFrequency,
  idToken: string,
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot update saved job.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-jobs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ alertFrequency }),
  });

  if (!res.ok) {
    throw new Error(`Update saved job API responded with ${res.status}`);
  }
};

/**
 * Removes one of the signed-in user's saved jobs. The API rejects the
 * request if `id` isn't owned by the token's uid.
 */
export const deleteSavedJob = async (id: string, idToken: string): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot delete saved job.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/saved-jobs/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Delete saved job API responded with ${res.status}`);
  }
};
