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
  member_id: string;
  name: string;
  role: string;
  age: number;
  sex: "M" | "F";
  status?: "Malnourished" | "Healthy" | "At-Risk";
  // Standard 2-week recall period for childhood diarrhoea prevalence, the
  // same convention DHS/MICS-style household surveys use — this is what
  // makes the under-5 diarrhoea query real rather than household-level.
  diarrhoeaLast2Weeks?: boolean;
}

export interface VisitRecord {
  date: string;
  agent: string;
  action: string;
  isCritical: boolean;
}

// Practical round-number bands for relative income tiering — not an
// officially sourced poverty-line threshold. A monthly income bracket
// (rather than an exact figure) is easier for a household to answer
// honestly given informal/irregular income, less sensitive to collect, and
// still ordinal enough to rank households into a real relative tier.
export const INCOME_BRACKETS = [
  "Under UGX 100,000",
  "UGX 100,000–300,000",
  "UGX 300,000–700,000",
  "UGX 700,000–1,500,000",
  "Over UGX 1,500,000",
] as const;
export type IncomeBracket = (typeof INCOME_BRACKETS)[number];

// district_id/county_id/subcounty_id are a deterministic slug of the real
// gazetted name (see adminData.ts's slugify()), not an official government
// P-code — this project has no verified source for real Uganda P-codes.
// parish_id/village_id are just the operator's typed/selected text, since
// there's no comprehensive reference dataset for either level (see
// DATA_SOURCES.md) — most parish_id values will be free text, not a slug.
export interface HouseholdLocation {
  district_id: string;
  county_id?: string;
  subcounty_id?: string;
  parish_id: string;
  village_id: string;
  latitude?: number;
  longitude?: number;
  captured_at?: string;
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
  location: HouseholdLocation;
  riskLevel: RiskLevel;
  healthStatus: string;
  waterSource: string;
  program: string;
  lastVisit?: string;
  health?: { maternal: string; immunization: string; chronic: string; consentCaptured?: boolean };
  wash?: { waterSource: string; distance: string; sanitation: string; handwashing: string };
  livelihoods?: { incomeSource: string; incomeBracket?: IncomeBracket; crops: string[]; foodSecurity: string };
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
