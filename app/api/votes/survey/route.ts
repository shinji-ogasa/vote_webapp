import { NextRequest, NextResponse } from "next/server";
import { getExistingVoteVisitorToken, hashVisitorToken } from "../../../../lib/vote-visitor";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import {
  normalizeAgeRange,
  normalizeComment,
  normalizeGender,
  normalizeTargetSlug,
} from "../../../../lib/votes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();
    if (typeof payload !== "object" || payload === null) {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    const body = payload as {
      target?: unknown;
      ageRange?: unknown;
      gender?: unknown;
      comment?: unknown;
    };
    const targetSlug = normalizeTargetSlug(body.target ?? "me");
    const ageRange = normalizeAgeRange(body.ageRange);
    const gender = normalizeGender(body.gender);
    const comment = normalizeComment(body.comment);
    const token = await getExistingVoteVisitorToken();

    if (!token) {
      return NextResponse.json({ error: "VOTE_REQUIRED" }, { status: 409 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("face_votes")
      .update({ age_range: ageRange, gender, comment })
      .eq("target_slug", targetSlug)
      .eq("visitor_key_hash", hashVisitorToken(token))
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "VOTE_REQUIRED" }, { status: 409 });

    return NextResponse.json({ surveySubmitted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }
    if (error instanceof Error && ["INVALID_TARGET", "INVALID_AGE_RANGE", "INVALID_GENDER", "INVALID_COMMENT"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    console.error("face-vote survey API error", error);
    return NextResponse.json({ error: "SURVEY_SERVICE_UNAVAILABLE" }, { status: 500 });
  }
}
