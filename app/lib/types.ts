// Mirrors server/src/types/index.ts — kept in sync by hand since frontend and
// backend are separate npm packages. If this drifts, the backend is the source of truth.

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type UserRole =
  | "Super Admin"
  | "District Admin"
  | "Health Officer"
  | "Field Agent"
  | "Partner"
  | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  status: "Active" | "Inactive" | "Pending";
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  name: string;
  role: string;
  age: number;
  sex: "M" | "F";
  status?: "Malnourished" | "Healthy" | "At-Risk";
}

export interface VisitRecord {
  date: string;
  agent: string;
  action: string;
  isCritical: boolean;
}

export interface Household {
  id: string;
  head: string;
  age?: number;
  phone?: string;
  nationalId?: string;
  members: number;
  under5Count?: number;
  householdMembers?: HouseholdMember[];
  village: string;
  parish: string;
  district: string;
  subcounty?: string;
  gps?: string;
  lat?: number;
  lng?: number;
  riskLevel: RiskLevel;
  healthStatus: string;
  waterSource: string;
  program: string;
  lastVisit?: string;
  health?: { maternal: string; immunization: string; chronic: string };
  wash?: { waterSource: string; distance: string; sanitation: string; handwashing: string };
  livelihoods?: { incomeSource: string; crops: string[]; foodSecurity: string };
  history?: VisitRecord[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  reviewStatus: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type HouseholdInput = Omit<Household, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "reviewStatus" | "reviewedBy" | "reviewedByName" | "reviewedAt" | "rejectionReason">;

export interface Personnel {
  name: string;
  phone: string;
  district: string;
  subcounty: string;
  region: string;
}

export type FacilityKind = "borehole" | "tap_stand" | "protected_spring" | "rain_tank" | "health_center" | "school" | "latrine";

export interface Facility {
  id: string;
  type: FacilityKind;
  name: string;
  district: string;
  subcounty?: string;
  village?: string;
  lat: number;
  lng: number;
  status: "functional" | "broken" | "unknown";
  issue?: string;
  daysDown?: number;
  assignedMechanic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, { before: unknown; after: unknown }>;
  timestamp: string;
}

export type ReportTemplateId = "health_status" | "wash_audit" | "vulnerability_index";

export interface ReportJob {
  id: string;
  templateId: ReportTemplateId;
  templateName: string;
  format: "pdf";
  district?: string;
  subcounty?: string;
  requestedBy: string;
  requestedByName: string;
  status: "ready" | "failed";
  errorMessage?: string;
  recordCount?: number;
  fileName: string;
  createdAt: string;
}
