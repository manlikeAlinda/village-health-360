import { Router } from "express";
import { z } from "zod";
import PDFDocument from "pdfkit";
import { db } from "../lib/firebase";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { writeAuditLog } from "../lib/auditLog";
import {
  generateHealthStatusReport,
  generateWashAuditReport,
  generateVulnerabilityIndexReport,
  REPORT_TEMPLATE_NAMES,
} from "../lib/reportGenerators";
import { Household, Facility, ReportJob, ReportTemplateId } from "../types";

const router = Router();
const COLLECTION = "reports";

router.use(requireAuth);

const PERIOD_IDS = ["all_time", "last_30_days", "last_quarter", "ytd", "custom"] as const;
type PeriodId = (typeof PERIOD_IDS)[number];

const generateSchema = z.object({
  templateId: z.enum(["health_status", "wash_audit", "vulnerability_index"]),
  district: z.string().optional(),
  subcounty: z.string().optional(),
  period: z.enum(PERIOD_IDS).default("all_time"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PERIOD_LABELS: Record<PeriodId, string> = {
  all_time: "All Time",
  last_30_days: "Last 30 Days",
  last_quarter: "Last Quarter",
  ytd: "Year to Date",
  custom: "Custom Range",
};

function periodRange(period: PeriodId, startDate?: string, endDate?: string): { from: Date | null; to: Date | null; label: string } {
  const now = new Date();
  switch (period) {
    case "last_30_days":
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now, label: PERIOD_LABELS[period] };
    case "last_quarter":
      return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now, label: PERIOD_LABELS[period] };
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), to: now, label: PERIOD_LABELS[period] };
    case "custom":
      return {
        from: startDate ? new Date(startDate) : null,
        to: endDate ? new Date(endDate) : null,
        label: `${startDate || "…"} to ${endDate || "…"}`,
      };
    default:
      return { from: null, to: null, label: PERIOD_LABELS[period] };
  }
}

// Reports are official exports — they only include supervisor-approved
// (canonical) household records, never still-pending field submissions.
async function fetchHouseholds(district?: string, subcounty?: string): Promise<Household[]> {
  let query: FirebaseFirestore.Query = db.collection("households").where("reviewStatus", "==", "approved");
  if (district) query = query.where("district", "==", district);
  if (subcounty) query = query.where("subcounty", "==", subcounty);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as Household);
}

async function fetchFacilities(district?: string): Promise<Facility[]> {
  let query: FirebaseFirestore.Query = db.collection("facilities");
  if (district) query = query.where("district", "==", district);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as Facility);
}

function withinPeriod(createdAt: string, from: Date | null, to: Date | null): boolean {
  if (!from && !to) return true;
  const d = new Date(createdAt);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// POST /api/reports/generate — produces a real PDF and logs a real job record, success or failure
router.post("/generate", async (req: AuthedRequest, res, next) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues.map((i) => i.message).join(", ")));
  }
  const { templateId, district, subcounty, period, startDate, endDate } = parsed.data;
  const templateName = REPORT_TEMPLATE_NAMES[templateId as ReportTemplateId];
  const { from, to, label } = periodRange(period, startDate, endDate);
  const fileName = `${templateId}_${(subcounty || district || "national").replace(/\s+/g, "_")}_${Date.now()}.pdf`;

  const jobRef = db.collection(COLLECTION).doc();
  const now = new Date().toISOString();

  try {
    let recordCount = 0;
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    if (templateId === "health_status") {
      const households = (await fetchHouseholds(district, subcounty)).filter((h) => withinPeriod(h.createdAt, from, to));
      recordCount = households.length;
      generateHealthStatusReport(doc, households, { district, subcounty, periodLabel: label });
    } else if (templateId === "wash_audit") {
      const facilities = (await fetchFacilities(district)).filter((f) => withinPeriod(f.createdAt, from, to));
      recordCount = facilities.length;
      generateWashAuditReport(doc, facilities, { district, subcounty, periodLabel: label });
    } else {
      const households = (await fetchHouseholds(district, subcounty))
        .filter((h) => withinPeriod(h.createdAt, from, to))
        .filter((h) => h.riskLevel === "Critical" || h.riskLevel === "High");
      recordCount = households.length;
      generateVulnerabilityIndexReport(doc, households, { district, subcounty, periodLabel: label });
    }

    doc.end();
    const pdfBuffer = await finished;

    const job: ReportJob = {
      id: jobRef.id,
      templateId: templateId as ReportTemplateId,
      templateName,
      format: "pdf",
      district,
      subcounty,
      requestedBy: req.user!.uid,
      requestedByName: req.user!.name,
      status: "ready",
      recordCount,
      fileName,
      createdAt: now,
    };
    await jobRef.set(job);
    await writeAuditLog({
      actor: { uid: req.user!.uid, name: req.user!.name },
      action: "report.generate",
      entityType: "report",
      entityId: jobRef.id,
      diff: { templateId: { before: null, after: templateId }, recordCount: { before: null, after: recordCount } },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("X-Report-Job-Id", jobRef.id);
    res.send(pdfBuffer);
  } catch (err) {
    const job: ReportJob = {
      id: jobRef.id,
      templateId: templateId as ReportTemplateId,
      templateName,
      format: "pdf",
      district,
      subcounty,
      requestedBy: req.user!.uid,
      requestedByName: req.user!.name,
      status: "failed",
      errorMessage: (err as Error).message,
      fileName,
      createdAt: now,
    };
    await jobRef.set(job).catch(() => {});
    next(new ApiError(500, `Report generation failed: ${(err as Error).message}`));
  }
});

// GET /api/reports — real job history, most recent first
router.get("/", async (_req, res, next) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy("createdAt", "desc").limit(50).get();
    const jobs = snapshot.docs.map((doc) => doc.data() as ReportJob);
    res.json({ data: jobs, total: jobs.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id/redownload — regenerates from the job's original filters (no file storage kept)
router.get("/:id/redownload", async (req, res, next) => {
  try {
    const jobDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!jobDoc.exists) throw new ApiError(404, `Report job ${req.params.id} not found`);
    const job = jobDoc.data() as ReportJob;
    if (job.status !== "ready") throw new ApiError(400, "Only successfully generated reports can be re-downloaded");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const scope = { district: job.district, subcounty: job.subcounty, periodLabel: "Re-generated (current data)" };
    if (job.templateId === "health_status") {
      const households = await fetchHouseholds(job.district, job.subcounty);
      generateHealthStatusReport(doc, households, scope);
    } else if (job.templateId === "wash_audit") {
      const facilities = await fetchFacilities(job.district);
      generateWashAuditReport(doc, facilities, scope);
    } else {
      const households = (await fetchHouseholds(job.district, job.subcounty)).filter((h) => h.riskLevel === "Critical" || h.riskLevel === "High");
      generateVulnerabilityIndexReport(doc, households, scope);
    }

    doc.end();
    const pdfBuffer = await finished;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${job.fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
