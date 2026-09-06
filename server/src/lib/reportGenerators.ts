import PDFDocument from "pdfkit";
import { Household, Facility, ReportTemplateId } from "../types";

interface ReportScope {
  district?: string;
  subcounty?: string;
  periodLabel: string;
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, scope: ReportScope) {
  doc.fontSize(20).fillColor("#004AAD").text(title, { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#666666").text(
    `Scope: ${scope.subcounty || scope.district || "National"} · Period: ${scope.periodLabel} · Generated: ${new Date().toLocaleString()}`
  );
  doc.moveDown(0.2);
  doc.strokeColor("#E5E7EB").moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(1);
}

function drawSummaryLine(doc: PDFKit.PDFDocument, label: string, value: string | number) {
  doc.fontSize(11).fillColor("#111827").text(`${label}: `, { continued: true }).fillColor("#004AAD").text(String(value));
}

function drawTableRow(doc: PDFKit.PDFDocument, cols: string[], widths: number[], opts: { bold?: boolean; color?: string } = {}) {
  const startX = doc.page.margins.left;
  const y = doc.y;
  doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(opts.color || "#111827");
  let x = startX;
  cols.forEach((col, i) => {
    doc.text(col, x, y, { width: widths[i], ellipsis: true });
    x += widths[i];
  });
  doc.moveDown(0.6);
  if (doc.y > doc.page.height - doc.page.margins.bottom - 40) {
    doc.addPage();
  }
}

export function generateHealthStatusReport(doc: PDFKit.PDFDocument, households: Household[], scope: ReportScope) {
  drawHeader(doc, "Monthly Health Status Report", scope);

  const byRisk: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  households.forEach((h) => { byRisk[h.riskLevel] = (byRisk[h.riskLevel] || 0) + 1; });

  drawSummaryLine(doc, "Total Households", households.length);
  drawSummaryLine(doc, "Critical Risk", byRisk.Critical);
  drawSummaryLine(doc, "High Risk", byRisk.High);
  doc.moveDown(1);

  const widths = [110, 90, 90, 70, 130];
  drawTableRow(doc, ["Head of Household", "Village", "Parish", "Risk", "Health Status"], widths, { bold: true });
  doc.strokeColor("#E5E7EB").moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.3);

  if (households.length === 0) {
    doc.fontSize(10).fillColor("#9CA3AF").text("No households match this scope and period.");
  }
  households.forEach((h) => {
    const riskColor = h.riskLevel === "Critical" ? "#DC2626" : h.riskLevel === "High" ? "#F97316" : "#111827";
    drawTableRow(doc, [h.head, h.village, h.parish, h.riskLevel, h.healthStatus], widths, { color: riskColor });
  });
}

export function generateWashAuditReport(doc: PDFKit.PDFDocument, facilities: Facility[], scope: ReportScope) {
  drawHeader(doc, "WASH Infrastructure Audit", scope);

  const functional = facilities.filter((f) => f.status === "functional").length;
  const broken = facilities.filter((f) => f.status === "broken").length;

  drawSummaryLine(doc, "Total Facilities", facilities.length);
  drawSummaryLine(doc, "Functional", functional);
  drawSummaryLine(doc, "Broken / Needs Repair", broken);
  doc.moveDown(1);

  const widths = [140, 90, 90, 80, 90];
  drawTableRow(doc, ["Name", "Type", "Subcounty", "Village", "Status"], widths, { bold: true });
  doc.strokeColor("#E5E7EB").moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.3);

  if (facilities.length === 0) {
    doc.fontSize(10).fillColor("#9CA3AF").text("No facilities match this scope.");
  }
  facilities.forEach((f) => {
    drawTableRow(doc, [f.name, f.type.replace("_", " "), f.subcounty || "—", f.village || "—", f.status], widths, {
      color: f.status === "broken" ? "#DC2626" : "#111827",
    });
  });
}

export function generateVulnerabilityIndexReport(doc: PDFKit.PDFDocument, households: Household[], scope: ReportScope) {
  drawHeader(doc, "Vulnerability Index — Critical & High Priority Households", scope);

  drawSummaryLine(doc, "Households Flagged", households.length);
  doc.moveDown(1);

  const widths = [110, 90, 90, 60, 140];
  drawTableRow(doc, ["Head of Household", "Village", "Parish", "Risk", "Health Status"], widths, { bold: true });
  doc.strokeColor("#E5E7EB").moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.3);

  if (households.length === 0) {
    doc.fontSize(10).fillColor("#9CA3AF").text("No Critical or High risk households in this scope.");
  }
  households.forEach((h) => {
    drawTableRow(doc, [h.head, h.village, h.parish, h.riskLevel, h.healthStatus], widths, {
      color: h.riskLevel === "Critical" ? "#DC2626" : "#F97316",
    });
  });
}

export const REPORT_TEMPLATE_NAMES: Record<ReportTemplateId, string> = {
  health_status: "Monthly Health Status",
  wash_audit: "WASH Infrastructure Audit",
  vulnerability_index: "Vulnerability Index",
};
