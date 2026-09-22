import { NextResponse } from "next/server";
import { isAdminAuthConfigured, isAdminAuthenticated } from "../../../../lib/admin-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

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
    const { data, error } = await getSupabaseAdmin()
      .from("face_votes")
      .select("id, created_at, choice, age_range, gender, comment")
      .eq("target_slug", "me")
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) throw error;
    return NextResponse.json({ comments: data ?? [] }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503, headers: noStoreHeaders });
    }
    console.error("face-vote admin comments API error", error);
    return NextResponse.json({ error: "COMMENTS_UNAVAILABLE" }, { status: 500, headers: noStoreHeaders });
  }
}
