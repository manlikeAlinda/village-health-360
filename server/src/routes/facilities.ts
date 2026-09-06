import { Router } from "express";
import { db } from "../lib/firebase";
import { requireAuth } from "../middleware/auth";
import { Facility } from "../types";

const router = Router();
const COLLECTION = "facilities";

router.use(requireAuth);

// GET /api/facilities?district=&type=
// Read-only for now — facilities are seeded via scripts/seedFacilities.ts, not
// created through the app yet. A create/edit UI is a natural follow-up once this
// is proven useful, but wasn't asked for in this pass.
router.get("/", async (req, res, next) => {
  try {
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    const { district, type } = req.query;
    if (typeof district === "string" && district) query = query.where("district", "==", district);
    if (typeof type === "string" && type) query = query.where("type", "==", type);

    const snapshot = await query.get();
    const facilities = snapshot.docs.map((doc) => doc.data() as Facility);
    res.json({ data: facilities, total: facilities.length });
  } catch (err) {
    next(err);
  }
});

export default router;
