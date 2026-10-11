// Formats a job's all-time view count for display on its /jobs/[id] page.
export const formatViewCount = (count: number): string =>
  `Viewed by ${count} job seeker${count === 1 ? "" : "s"}`;
