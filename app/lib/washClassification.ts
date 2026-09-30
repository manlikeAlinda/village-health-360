// WHO/UNICEF JMP (Joint Monitoring Programme) sanitation ladder — the
// standard international classification for household sanitation facilities.
// Real categories, not invented:
//   Improved         — flush/pour-flush to sewer/septic/pit, ventilated
//                       improved pit (VIP) latrine, pit latrine with a slab,
//                       composting toilet.
//   Unimproved        — pit latrine without a slab, hanging latrine, bucket.
//   Open Defecation   — no facility used.
//
// This app's household `wash.sanitation` field is free text (whatever a
// field agent typed), not a controlled enum, so classification here is
// keyword matching — the same convention already used for water source via
// SAFE_WATER_KEYWORDS in app/wash/page.tsx. It will misclassify unusual
// phrasing; treat it as a best-effort grouping of real recorded text, not an
// authoritative survey result.
export type SanitationClass = "Improved" | "Unimproved" | "Open Defecation" | "Not Recorded";

const OPEN_DEFECATION_KEYWORDS = ["open defecation", "no facility", "no toilet", "bush", "forest", "none"];
const IMPROVED_KEYWORDS = ["flush", "pour-flush", "pour flush", "vip", "ventilated", "slab", "septic", "sewer", "composting"];
const UNIMPROVED_KEYWORDS = ["pit latrine", "pit", "hanging", "bucket", "traditional", "uncovered"];

export function classifySanitation(value: string | undefined | null): SanitationClass {
  const v = value?.trim().toLowerCase();
  if (!v) return "Not Recorded";
  if (OPEN_DEFECATION_KEYWORDS.some((kw) => v.includes(kw))) return "Open Defecation";
  if (IMPROVED_KEYWORDS.some((kw) => v.includes(kw))) return "Improved";
  if (UNIMPROVED_KEYWORDS.some((kw) => v.includes(kw))) return "Unimproved";
  return "Not Recorded";
}
