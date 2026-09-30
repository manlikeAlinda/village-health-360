import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/firebase";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, requireMinRole, AuthedRequest, isAtLeast } from "../middleware/auth";
import { writeAuditLog, diffFields, snapshotFields } from "../lib/auditLog";
import { slugify } from "../lib/slugify";
import { Household, HouseholdMember, UserRole, INCOME_BRACKETS } from "../types";

const router = Router();
const COLLECTION = "households";

router.use(requireAuth);

const householdMemberSchema = z.object({
  member_id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  age: z.number().int().nonnegative(),
  sex: z.enum(["M", "F"]),
  status: z.enum(["Malnourished", "Healthy", "At-Risk"]).optional(),
  diarrhoeaLast2Weeks: z.boolean().optional(),
});

const visitRecordSchema = z.object({
  date: z.string(),
  agent: z.string(),
  action: z.string(),
  isCritical: z.boolean(),
});

const locationSchema = z.object({
  district_id: z.string().min(1),
  county_id: z.string().optional(),
  subcounty_id: z.string().optional(),
  parish_id: z.string().min(1),
  village_id: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  captured_at: z.string().optional(),
});

const householdInputSchema = z.object({
  head: z.string().min(1),
  age: z.number().int().nonnegative().optional(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  members: z.number().int().nonnegative(),
  under5Count: z.number().int().nonnegative().optional(),
  householdMembers: z.array(householdMemberSchema).optional(),
  location: locationSchema,
  riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
  healthStatus: z.string().min(1),
  waterSource: z.string().min(1),
  program: z.string().min(1),
  lastVisit: z.string().optional(),
  health: z.object({ maternal: z.string(), immunization: z.string(), chronic: z.string(), consentCaptured: z.boolean().optional() }).optional(),
  wash: z.object({ waterSource: z.string(), distance: z.string(), sanitation: z.string(), handwashing: z.string() }).optional(),
  livelihoods: z.object({ incomeSource: z.string(), incomeBracket: z.enum(INCOME_BRACKETS).optional(), crops: z.array(z.string()), foodSecurity: z.string() }).optional(),
  history: z.array(visitRecordSchema).optional(),
});

// Health is a restricted access tier (see Slide 8 of the household-anchor
// deck): Viewer and Partner — external/read-only roles — get the record
// with health data stripped; Field Agent and above, who actually do
// fieldwork/oversight, see it in full. This only touches household.health
// and the per-member status/diarrhoeaLast2Weeks fields — the older,
// broader `healthStatus` summary field used elsewhere (WASH/Livelihoods
// risk derivation) is untouched.
function redactHealthData(household: Household, role: UserRole): Household {
  if (isAtLeast(role, "Field Agent")) return household;
  const { health, ...rest } = household;
  return {
    ...rest,
    householdMembers: household.householdMembers?.map((m): HouseholdMember => {
      const { status, diarrhoeaLast2Weeks, ...member } = m;
      return member;
    }),
  };
}

// Only top-level, single-field columns are server-sortable. Members,
// Under-5s and Last Activity are derived at render time (preferring
// householdMembers/history over the stale members/under5Count/lastVisit
// fields — see the households-table audit) and have no single stored field
// to order Firestore by without denormalizing them onto the document, which
// is out of scope here.
const SORTABLE_FIELDS = ["head", "createdAt", "riskLevel", "reviewStatus"] as const;
type SortField = (typeof SORTABLE_FIELDS)[number];
function isSortField(v: unknown): v is SortField {
  return typeof v === "string" && (SORTABLE_FIELDS as readonly string[]).includes(v);
}

// GET /api/households?district=&subcounty=&riskLevel=&search=&reviewStatus=&page=&pageSize=&sortBy=&sortDir=
// page/pageSize are opt-in: omitting them preserves the previous
// "return every matching record" behaviour, which the Health/WASH/
// Livelihoods dashboards rely on for their real aggregate calculations —
// only the Households list page passes them.
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    // district/subcounty arrive as display names from the frontend's
    // admin-hierarchy selects — slugify to match the stored location IDs.
    const { district, subcounty, riskLevel, reviewStatus, sortBy, sortDir } = req.query;
    if (typeof district === "string" && district) query = query.where("location.district_id", "==", slugify(district));
    if (typeof subcounty === "string" && subcounty) query = query.where("location.subcounty_id", "==", slugify(subcounty));
    if (typeof riskLevel === "string" && riskLevel) query = query.where("riskLevel", "==", riskLevel);
    if (typeof reviewStatus === "string" && reviewStatus) query = query.where("reviewStatus", "==", reviewStatus);

    if (sortBy !== undefined && !isSortField(sortBy)) {
      throw new ApiError(400, `Unsupported sortBy field: ${String(sortBy)}. Allowed: ${SORTABLE_FIELDS.join(", ")}`);
    }
    const direction: FirebaseFirestore.OrderByDirection = sortDir === "desc" ? "desc" : "asc";

    const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
    const pageRaw = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    const pageSizeRaw = typeof req.query.pageSize === "string" ? Number(req.query.pageSize) : undefined;
    const paginated = pageRaw !== undefined && pageSizeRaw !== undefined;
    if (paginated && (!Number.isInteger(pageRaw) || pageRaw < 1 || !Number.isInteger(pageSizeRaw) || pageSizeRaw < 1 || pageSizeRaw > 100)) {
      throw new ApiError(400, "page must be a positive integer and pageSize a positive integer <= 100");
    }
    const page = pageRaw ?? 1;
    const pageSize = pageSizeRaw ?? 0;

    if (paginated && !search) {
      // Firestore can slice server-side — no in-memory filtering needed.
      const total = (await query.count().get()).data().count;
      query = query.orderBy(sortBy as SortField ?? "createdAt", sortBy ? direction : "desc");
      query = query.offset((page - 1) * pageSize).limit(pageSize);
      const snapshot = await query.get();
      const redacted = snapshot.docs.map((doc) => redactHealthData(doc.data() as Household, req.user!.role));
      res.json({ data: redacted, total, page, pageSize });
      return;
    }

    // Free-text search has no Firestore query equivalent, so this path
    // fetches every where()-matching record and filters/sorts/paginates in
    // memory. This is also the path unpaginated callers (dashboards) use.
    const snapshot = await query.get();
    let households = snapshot.docs.map((doc) => doc.data() as Household);

    if (search) {
      households = households.filter(
        (h) =>
          h.head.toLowerCase().includes(search) ||
          (h.location?.village_id ?? "").toLowerCase().includes(search) ||
          h.id.toLowerCase().includes(search)
      );
    }

    if (isSortField(sortBy)) {
      const field = sortBy;
      households.sort((a, b) => {
        const av = String(a[field] ?? "");
        const bv = String(b[field] ?? "");
        return direction === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
      });
    }

    const total = households.length;
    if (paginated) households = households.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    const redacted = households.map((h) => redactHealthData(h, req.user!.role));
    res.json({ data: redacted, total, ...(paginated ? { page, pageSize } : {}) });
  } catch (err) {
    next(err);
  }
});

// GET /api/households/:id
router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) throw new ApiError(404, `Household ${req.params.id} not found`);
    res.json({ data: redactHealthData(doc.data() as Household, req.user!.role) });
  } catch (err) {
    next(err);
  }
});

// POST /api/households — Field Agent or above
router.post("/", requireMinRole("Field Agent"), async (req: AuthedRequest, res, next) => {
  try {
    const parsed = householdInputSchema.parse(req.body);
    const ref = db.collection(COLLECTION).doc();
    const now = new Date().toISOString();
    const autoApproved = isAtLeast(req.user!.role, "District Admin");
    const household: Household = {
      ...parsed,
      id: ref.id,
      createdAt: now,
      createdBy: req.user!.uid,
      updatedAt: now,
      updatedBy: req.user!.uid,
      reviewStatus: autoApproved ? "approved" : "pending",
      ...(autoApproved ? { reviewedBy: req.user!.uid, reviewedByName: req.user!.name, reviewedAt: now } : {}),
    };
    await ref.set(household);
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "household.create",
      entityType: "household",
      entityId: household.id,
      diff: snapshotFields(household, "created"),
    });
    res.status(201).json({ data: household });
  } catch (err) {
    next(err);
  }
});

// PUT /api/households/:id — Field Agent or above
router.put("/:id", requireMinRole("Field Agent"), async (req: AuthedRequest, res, next) => {
  try {
    const parsed = householdInputSchema.partial().parse(req.body);
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) throw new ApiError(404, `Household ${req.params.id} not found`);
    const before = existing.data() as Household;

    const now = new Date().toISOString();
    const autoApproved = isAtLeast(req.user!.role, "District Admin");
    const updated = {
      ...parsed,
      updatedAt: now,
      updatedBy: req.user!.uid,
      // The record changed, so it needs re-review — unless a supervisor made
      // the edit themselves, in which case they're already signing off on it.
      reviewStatus: autoApproved ? "approved" : "pending",
      ...(autoApproved
        ? { reviewedBy: req.user!.uid, reviewedByName: req.user!.name, reviewedAt: now }
        : { reviewedBy: null, reviewedByName: null, reviewedAt: null, rejectionReason: null }),
    };
    await ref.update(updated);
    const fresh = await ref.get();
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "household.update",
      entityType: "household",
      entityId: req.params.id,
      diff: diffFields(before, parsed),
    });
    res.json({ data: fresh.data() as Household });
  } catch (err) {
    next(err);
  }
});

// PUT /api/households/:id/review — District Admin or above: approve or reject a pending submission
const reviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

router.put("/:id/review", requireMinRole("District Admin"), async (req: AuthedRequest, res, next) => {
  try {
    const { decision, reason } = reviewSchema.parse(req.body);
    if (decision === "rejected" && !reason) {
      throw new ApiError(400, "A reason is required when rejecting a submission");
    }

    const ref = db.collection(COLLECTION).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) throw new ApiError(404, `Household ${req.params.id} not found`);
    const before = existing.data() as Household;

    const now = new Date().toISOString();
    const update = {
      reviewStatus: decision,
      reviewedBy: req.user!.uid,
      reviewedByName: req.user!.name,
      reviewedAt: now,
      rejectionReason: decision === "rejected" ? reason : null,
    };
    await ref.update(update);
    const fresh = await ref.get();

    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: decision === "approved" ? "household.approve" : "household.reject",
      entityType: "household",
      entityId: req.params.id,
      diff: diffFields(before, update),
    });

    res.json({ data: fresh.data() as Household });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/households/:id — District Admin or above (more sensitive than create/edit)
router.delete("/:id", requireMinRole("District Admin"), async (req: AuthedRequest, res, next) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) throw new ApiError(404, `Household ${req.params.id} not found`);
    const deleted = existing.data() as Household;
    await ref.delete();
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "household.delete",
      entityType: "household",
      entityId: req.params.id,
      diff: snapshotFields(deleted, "deleted"),
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
