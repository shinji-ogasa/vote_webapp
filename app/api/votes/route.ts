import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getVoteVisitorToken, hashVisitorToken, setVoteCookie } from "../../../lib/vote-visitor";
import {
  getPercent,
  normalizeTargetSlug,
  normalizeVoteChoice,
  type VoteChoice,
} from "../../../lib/votes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readResults(targetSlug: string, visitorHash: string) {
  const supabase = getSupabaseAdmin();
  const [goodResult, badResult, visitorResult] = await Promise.all([
    supabase.from("face_votes").select("id", { count: "exact", head: true }).eq("target_slug", targetSlug).eq("choice", "good"),
    supabase.from("face_votes").select("id", { count: "exact", head: true }).eq("target_slug", targetSlug).eq("choice", "bad"),
    supabase.from("face_votes").select("age_range, gender").eq("target_slug", targetSlug).eq("visitor_key_hash", visitorHash).maybeSingle(),
  ]);

  const error = goodResult.error || badResult.error || visitorResult.error;
  if (error) throw error;

  const good = goodResult.count ?? 0;
  const bad = badResult.count ?? 0;
  const total = good + bad;
  return {
    good,
    bad,
    total,
    goodPercent: getPercent(good, total),
    badPercent: getPercent(bad, total),
    hasVoted: Boolean(visitorResult.data),
    surveySubmitted: Boolean(visitorResult.data?.age_range && visitorResult.data.gender),
  };
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
    return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503 });
  }
  if (error instanceof Error && (error.message === "INVALID_TARGET" || error.message === "INVALID_CHOICE")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error("face-vote API error", error);
  return NextResponse.json({ error: "VOTE_SERVICE_UNAVAILABLE" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const targetSlug = normalizeTargetSlug(request.nextUrl.searchParams.get("target") || "me");
    const { token, shouldSet } = await getVoteVisitorToken();
    const results = await readResults(targetSlug, hashVisitorToken(token));
    const response = NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
    if (shouldSet) setVoteCookie(response, token);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();
    if (typeof payload !== "object" || payload === null) {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }
    const body = payload as { target?: unknown; choice?: unknown };
    const targetSlug = normalizeTargetSlug(body.target || "me");
    const choice = normalizeVoteChoice(body.choice) as VoteChoice;
    const { token, shouldSet } = await getVoteVisitorToken();
    const visitorHash = hashVisitorToken(token);
    const supabase = getSupabaseAdmin();
    const { error: insertError } = await supabase.from("face_votes").insert({
      target_slug: targetSlug,
      choice,
      visitor_key_hash: visitorHash,
    });

    if (insertError && insertError.code !== "23505") throw insertError;

    const results = await readResults(targetSlug, visitorHash);
    const response = NextResponse.json(
      { ...results, hasVoted: true, alreadyVoted: Boolean(insertError) },
      { headers: { "Cache-Control": "no-store" } },
    );
    if (shouldSet) setVoteCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }
    return errorResponse(error);
  }
}
