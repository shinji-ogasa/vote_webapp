import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "face-check-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 12;
const MIN_PASSWORD_LENGTH = 32;

function getAdminPassword() {
  return process.env.FACE_CHECK_ADMIN_PASSWORD || "";
}

export function isAdminAuthConfigured() {
  return getAdminPassword().length >= MIN_PASSWORD_LENGTH;
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function matchesAdminPassword(candidate: unknown) {
  if (!isAdminAuthConfigured() || typeof candidate !== "string" || candidate.length > 512) {
    return false;
  }
  return safeEqual(candidate, getAdminPassword());
}

function signExpiry(expiresAt: number) {
  return createHmac("sha256", getAdminPassword())
    .update(`face-check-admin:v1:${expiresAt}`)
    .digest("base64url");
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthConfigured()) return false;

  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  const match = value?.match(/^v1\.(\d{10})\.([A-Za-z0-9_-]{43})$/);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  return safeEqual(match[2], signExpiry(expiresAt));
}

export function setAdminSession(response: NextResponse) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  response.cookies.set(ADMIN_COOKIE, `v1.${expiresAt}.${signExpiry(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}
