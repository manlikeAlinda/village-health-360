import { Router } from "express";
import { z } from "zod";
import { auth, db } from "../lib/firebase";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { writeAuditLog, diffFields, snapshotFields } from "../lib/auditLog";
import { AppUser, UserRole } from "../types";

const router = Router();
const COLLECTION = "users";
const ROLES: [UserRole, ...UserRole[]] = ["Super Admin", "District Admin", "Health Officer", "Field Agent", "Partner", "Viewer"];
const MANAGE_USERS = requireRole("Super Admin", "District Admin");

router.use(requireAuth);

// GET /api/users — Super Admin / District Admin only
router.get("/", MANAGE_USERS, async (_req, res, next) => {
  try {
    const snapshot = await db.collection(COLLECTION).get();
    const users = snapshot.docs.map((doc) => doc.data() as AppUser);
    res.json({ data: users, total: users.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me — any authenticated user can read their own profile
router.get("/me", async (req: AuthedRequest, res, next) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.user!.uid).get();
    res.json({ data: doc.data() as AppUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/users — invite a new user (creates Firebase Auth account + profile + role claim)
const inviteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(ROLES),
  district: z.string().optional(),
  temporaryPassword: z.string().min(8),
});

router.post("/", MANAGE_USERS, async (req: AuthedRequest, res, next) => {
  let createdAuthUid: string | undefined;
  try {
    const parsed = inviteSchema.parse(req.body);

    const authUser = await auth.createUser({
      email: parsed.email,
      password: parsed.temporaryPassword,
      displayName: parsed.name,
    }).catch((err) => {
      if (err?.code === "auth/email-already-exists") {
        throw new ApiError(409, `${parsed.email} is already registered`);
      }
      throw err;
    });
    createdAuthUid = authUser.uid;
    await auth.setCustomUserClaims(authUser.uid, { role: parsed.role });

    const now = new Date().toISOString();
    const profile: AppUser = {
      id: authUser.uid,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      district: parsed.district,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTION).doc(authUser.uid).set(profile);
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "user.invite",
      entityType: "user",
      entityId: profile.id,
      diff: snapshotFields({ name: profile.name, email: profile.email, role: profile.role, district: profile.district ?? null }, "created"),
    });

    res.status(201).json({ data: profile });
  } catch (err) {
    if (createdAuthUid) {
      await auth.deleteUser(createdAuthUid).catch(() => {
        // Best-effort rollback — if this also fails, the orphaned Auth user
        // needs manual cleanup, but we don't want to mask the original error.
      });
    }
    next(err);
  }
});

// PUT /api/users/:id — update role/status/profile fields
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
  district: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Pending"]).optional(),
});

router.put("/:id", MANAGE_USERS, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = updateSchema.parse(req.body);
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) throw new ApiError(404, `User ${req.params.id} not found`);
    const before = existing.data() as AppUser;

    if (parsed.role) {
      await auth.setCustomUserClaims(req.params.id, { role: parsed.role });
    }

    const updated = { ...parsed, updatedAt: new Date().toISOString() };
    await ref.update(updated);
    const fresh = await ref.get();
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "user.update",
      entityType: "user",
      entityId: req.params.id,
      diff: diffFields(before, parsed),
    });
    res.json({ data: fresh.data() as AppUser });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — Super Admin only: removes both the Auth account and profile
router.delete("/:id", requireRole("Super Admin"), async (req: AuthedRequest, res, next) => {
  try {
    if (req.params.id === req.user!.uid) {
      throw new ApiError(400, "You cannot delete your own account");
    }
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) throw new ApiError(404, `User ${req.params.id} not found`);

    const deleted = existing.data() as AppUser;
    await auth.deleteUser(req.params.id).catch(() => {
      // Auth user may already be gone — profile deletion still proceeds.
    });
    await ref.delete();
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "user.delete",
      entityType: "user",
      entityId: req.params.id,
      diff: snapshotFields({ name: deleted.name, email: deleted.email, role: deleted.role }, "deleted"),
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
