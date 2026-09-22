export const DEFAULT_TARGET_SLUG = "me";
export const VOTE_CHOICES = ["good", "bad"] as const;
export type VoteChoice = (typeof VOTE_CHOICES)[number];
export const AGE_RANGES = ["under_20", "20s", "30s", "40s", "50s", "60_plus", "prefer_not_to_say"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];
export const GENDERS = ["woman", "man", "non_binary", "other", "prefer_not_to_say"] as const;
export type Gender = (typeof GENDERS)[number];

export function normalizeTargetSlug(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9-]{1,64}$/.test(value)) {
    throw new Error("INVALID_TARGET");
  }
  return value;
}

export function normalizeVoteChoice(value: unknown): VoteChoice {
  if (value !== "good" && value !== "bad") throw new Error("INVALID_CHOICE");
  return value;
}

export function normalizeAgeRange(value: unknown): AgeRange {
  if (typeof value !== "string" || !AGE_RANGES.includes(value as AgeRange)) {
    throw new Error("INVALID_AGE_RANGE");
  }
  return value as AgeRange;
}

export function normalizeGender(value: unknown): Gender {
  if (typeof value !== "string" || !GENDERS.includes(value as Gender)) {
    throw new Error("INVALID_GENDER");
  }
  return value as Gender;
}

export function normalizeComment(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new Error("INVALID_COMMENT");
  const comment = value.trim();
  if (Array.from(comment).length > 280) throw new Error("INVALID_COMMENT");
  return comment || null;
}

export function getPercent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
