import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Personnel } from "../types";
import personnelData from "../data/personnel_data.json";

const router = Router();
const ALL_PERSONNEL = personnelData as Personnel[];

// The source data has inconsistent casing AND stray whitespace in district
// names (e.g. "Agago" and "Agago " were being counted as two different
// districts before this normalization existed) - trim + uppercase everywhere
// a district name is compared or grouped.
const norm = (s: string | undefined | null) => (s || "").trim().toUpperCase();

// Precomputed once at startup — the sidebar roster list needs a count per
// district, not all 40k+ records. Recomputing this per-request would be cheap
// enough anyway (a single pass), but there's no reason to redo it every call
// against data that never changes at runtime.
const COUNT_BY_DISTRICT: Record<string, number> = {};
for (const p of ALL_PERSONNEL) {
  const key = norm(p.district) || "UNKNOWN";
  COUNT_BY_DISTRICT[key] = (COUNT_BY_DISTRICT[key] || 0) + 1;
}

router.use(requireAuth);

// GET /api/personnel/summary — { district, count }[], one row per district present in the data
router.get("/summary", (_req, res) => {
  const summary = Object.entries(COUNT_BY_DISTRICT)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => a.district.localeCompare(b.district));
  res.json({ data: summary });
});

// GET /api/personnel?district=&subcounty=&region=&search=&page=&limit=
router.get("/", (req, res) => {
  const { district, subcounty, region, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));

  let results = ALL_PERSONNEL;

  if (typeof district === "string" && district) {
    const target = norm(district);
    results = results.filter((p) => norm(p.district) === target);
  }
  if (typeof subcounty === "string" && subcounty) {
    const target = norm(subcounty);
    results = results.filter((p) => norm(p.subcounty) === target);
  }
  if (typeof region === "string" && region) {
    const target = norm(region);
    results = results.filter((p) => norm(p.region) === target);
  }
  if (typeof search === "string" && search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.phone?.includes(q)
    );
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const page_data = results.slice(start, start + limit);

  res.json({ data: page_data, total, page, limit, totalPages: Math.ceil(total / limit) });
});

export default router;
