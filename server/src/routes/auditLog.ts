import { Router } from "express";
import { db } from "../lib/firebase";
import { requireAuth, requireRole } from "../middleware/auth";
import { AuditLogEntry } from "../types";

const router = Router();
const COLLECTION = "audit_log";

router.use(requireAuth);

// GET /api/audit-log?limit=  — Super Admin / District Admin only, most recent first
router.get("/", requireRole("Super Admin", "District Admin"), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const snapshot = await db.collection(COLLECTION).orderBy("timestamp", "desc").limit(limit).get();
    const entries = snapshot.docs.map((doc) => doc.data() as AuditLogEntry);
    res.json({ data: entries, total: entries.length });
  } catch (err) {
    next(err);
  }
});

export default router;
