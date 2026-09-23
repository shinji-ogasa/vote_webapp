import { NextResponse } from "next/server";
import { isAdminAuthConfigured, isAdminAuthenticated } from "../../../../lib/admin-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import { DEFAULT_TARGET_SLUG, getPercent } from "../../../../lib/votes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store, private" };

export async function GET() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "ADMIN_AUTH_NOT_CONFIGURED" }, { status: 503, headers: noStoreHeaders });
  }
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401, headers: noStoreHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [commentsResult, goodVotesResult, badVotesResult] = await Promise.all([
      supabase
        .from("face_votes")
        .select("id, created_at, choice, age_range, gender, comment")
        .eq("target_slug", DEFAULT_TARGET_SLUG)
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(250),
      supabase
        .from("face_votes")
        .select("id", { count: "exact", head: true })
        .eq("target_slug", DEFAULT_TARGET_SLUG)
        .eq("choice", "good"),
      supabase
        .from("face_votes")
        .select("id", { count: "exact", head: true })
        .eq("target_slug", DEFAULT_TARGET_SLUG)
        .eq("choice", "bad"),
    ]);

    const error = commentsResult.error || goodVotesResult.error || badVotesResult.error;
    if (error) throw error;

    const good = goodVotesResult.count ?? 0;
    const bad = badVotesResult.count ?? 0;
    const total = good + bad;
    return NextResponse.json({
      comments: commentsResult.data ?? [],
      voteStats: {
        total,
        good,
        bad,
        goodPercent: getPercent(good, total),
        badPercent: getPercent(bad, total),
      },
    }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503, headers: noStoreHeaders });
    }
    console.error("face-vote admin comments API error", error);
    return NextResponse.json({ error: "COMMENTS_UNAVAILABLE" }, { status: 500, headers: noStoreHeaders });
  }
}
