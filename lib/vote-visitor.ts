import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const VOTE_COOKIE = "face-vote-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getVoteVisitorToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTE_COOKIE)?.value;
  return { token: existing || randomUUID(), shouldSet: !existing };
}

export async function getExistingVoteVisitorToken() {
  const cookieStore = await cookies();
  return cookieStore.get(VOTE_COOKIE)?.value;
}

export function hashVisitorToken(token: string): string {
  const secret = process.env.FACE_VOTE_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_NOT_CONFIGURED");
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export function setVoteCookie(response: NextResponse, token: string): void {
  response.cookies.set(VOTE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}
