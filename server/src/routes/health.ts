import { Router } from "express";
import { db } from "../lib/firebase";

const router = Router();

// Real health check: proves the API can actually reach Firestore,
// unlike the mocked "99.9% uptime" figure the frontend used to show.
router.get("/", async (_req, res) => {
  try {
    await db.collection("_health").doc("ping").set({ at: new Date().toISOString() });
    res.json({ status: "ok", firestore: "reachable" });
  } catch (err) {
    res.status(503).json({ status: "error", firestore: "unreachable", detail: (err as Error).message });
  }
});

export default router;
