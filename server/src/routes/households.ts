import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/firebase";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, requireMinRole, AuthedRequest } from "../middleware/auth";
import { writeAuditLog, diffFields, snapshotFields } from "../lib/auditLog";
import { Household } from "../types";

const router = Router();
const COLLECTION = "households";

router.use(requireAuth);

const householdMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  age: z.number().int().nonnegative(),
  sex: z.enum(["M", "F"]),
  status: z.enum(["Malnourished", "Healthy", "At-Risk"]).optional(),
});

const visitRecordSchema = z.object({
  date: z.string(),
  agent: z.string(),
  action: z.string(),
  isCritical: z.boolean(),
});

const householdInputSchema = z.object({
  head: z.string().min(1),
  age: z.number().int().nonnegative().optional(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  members: z.number().int().nonnegative(),
  under5Count: z.number().int().nonnegative().optional(),
  householdMembers: z.array(householdMemberSchema).optional(),
  village: z.string().min(1),
  parish: z.string().min(1),
  district: z.string().min(1),
  subcounty: z.string().optional(),
  gps: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
  healthStatus: z.string().min(1),
  waterSource: z.string().min(1),
  program: z.string().min(1),
  lastVisit: z.string().optional(),
  health: z.object({ maternal: z.string(), immunization: z.string(), chronic: z.string() }).optional(),
  wash: z.object({ waterSource: z.string(), distance: z.string(), sanitation: z.string(), handwashing: z.string() }).optional(),
  livelihoods: z.object({ incomeSource: z.string(), crops: z.array(z.string()), foodSecurity: z.string() }).optional(),
  history: z.array(visitRecordSchema).optional(),
});

// GET /api/households?district=&subcounty=&riskLevel=&search=
router.get("/", async (req, res, next) => {
  try {
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    const { district, subcounty, riskLevel } = req.query;
    if (typeof district === "string" && district) query = query.where("district", "==", district);
    if (typeof subcounty === "string" && subcounty) query = query.where("subcounty", "==", subcounty);
    if (typeof riskLevel === "string" && riskLevel) query = query.where("riskLevel", "==", riskLevel);

    const snapshot = await query.get();
    let households = snapshot.docs.map((doc) => doc.data() as Household);

    const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
    if (search) {
      households = households.filter(
        (h) =>
          h.head.toLowerCase().includes(search) ||
          h.village.toLowerCase().includes(search) ||
          h.id.toLowerCase().includes(search)
      );
    }

    res.json({ data: households, total: households.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/households/:id
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) throw new ApiError(404, `Household ${req.params.id} not found`);
    res.json({ data: doc.data() as Household });
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
    const household: Household = {
      ...parsed,
      id: ref.id,
      createdAt: now,
      createdBy: req.user!.uid,
      updatedAt: now,
      updatedBy: req.user!.uid,
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

    const updated = {
      ...parsed,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user!.uid,
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
