import { CsvData } from "@/types";

// Undefined until the API starts returning `id` (see BACKEND_REPO_PLAN.md
// §5 / the "job detail pages" plan) — callers must handle that and fall
// back to the current (modal-only) behavior rather than link to a 404.
export const jobHref = (job: CsvData): string | undefined =>
  job.id ? `/jobs/${job.id}` : undefined;
