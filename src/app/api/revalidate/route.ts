import { revalidateTag } from "next/cache";

export async function GET() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/New_York",
    }).format(new Date()),
  );

  if (![3, 9, 15, 21].includes(hour)) {
    return Response.json({ skipped: true });
  }

  revalidateTag("leads", "max");

  return Response.json({ revalidated: true });
}
