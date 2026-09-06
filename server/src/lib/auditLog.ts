import { db } from "./firebase";
import { AuditLogEntry } from "../types";

const COLLECTION = "audit_log";

interface AuditActor {
  uid: string;
  name: string;
}

type FieldDiff = Record<string, { before: unknown; after: unknown }>;

/** Diff only the keys present in `after` — i.e. the fields an update actually touched. */
export function diffFields(before: object, after: object): FieldDiff {
  const b = before as Record<string, unknown>;
  const a = after as Record<string, unknown>;
  const diff: FieldDiff = {};
  for (const key of Object.keys(a)) {
    if (b[key] !== a[key]) {
      diff[key] = { before: b[key] ?? null, after: a[key] };
    }
  }
  return diff;
}

/** Full-record snapshot for create (direction: "created") or delete (direction: "deleted"). */
export function snapshotFields(record: object, direction: "created" | "deleted"): FieldDiff {
  const r = record as Record<string, unknown>;
  const diff: FieldDiff = {};
  for (const key of Object.keys(r)) {
    diff[key] = direction === "created" ? { before: null, after: r[key] } : { before: r[key], after: null };
  }
  return diff;
}

export async function writeAuditLog(params: {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  diff?: FieldDiff;
}) {
  const ref = db.collection(COLLECTION).doc();
  const entry: AuditLogEntry = {
    id: ref.id,
    actorId: params.actor.uid,
    actorName: params.actor.name,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    diff: params.diff,
    timestamp: new Date().toISOString(),
  };
  // Audit writes must never block or fail the request they're logging —
  // log and swallow rather than let a Firestore hiccup mask a successful mutation.
  await ref.set(entry).catch((err) => {
    console.error("Failed to write audit log entry:", err);
  });
}
