import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Called by the BGH Scout API after each ingest run so the site picks up fresh
// jobs immediately instead of waiting for the 15-minute fetch cache to lapse.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  // "max" (the usual recommendation) serves stale content while revalidating
  // in the background — the opposite of what this endpoint is for. This is
  // the webhook case the Next docs call out explicitly: expire immediately
  // so the very next request gets fresh data, not another round of stale.
  revalidateTag("leads", { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
