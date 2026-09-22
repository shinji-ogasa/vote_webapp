import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminAuthConfigured,
  matchesAdminPassword,
  setAdminSession,
} from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store, private" };

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "ADMIN_AUTH_NOT_CONFIGURED" }, { status: 503, headers: noStoreHeaders });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400, headers: noStoreHeaders });
  }

  const password = typeof payload === "object" && payload !== null
    ? (payload as { password?: unknown }).password
    : undefined;
  if (!matchesAdminPassword(password)) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401, headers: noStoreHeaders });
  }

  const response = NextResponse.json({ authenticated: true }, { headers: noStoreHeaders });
  setAdminSession(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false }, { headers: noStoreHeaders });
  clearAdminSession(response);
  return response;
}
