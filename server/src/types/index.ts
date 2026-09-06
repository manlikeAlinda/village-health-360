export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type UserRole =
  | "Super Admin"
  | "District Admin"
  | "Health Officer"
  | "Field Agent"
  | "Partner"
  | "Viewer";

// --- households/{id} ---
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
  members: number; // headcount, shown in the registry list
  under5Count?: number;
  householdMembers?: HouseholdMember[]; // detailed roster, shown on the profile page
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
}

// --- facilities/{id} — water points, health centers, schools, latrines ---
export type FacilityType = "borehole" | "tap_stand" | "protected_spring" | "rain_tank" | "health_center" | "school" | "latrine";
export type FacilityStatus = "functional" | "broken" | "unknown";

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  district: string;
  subcounty?: string;
  village?: string;
  lat: number;
  lng: number;
  status: FacilityStatus;
  issue?: string;
  daysDown?: number;
  assignedMechanic?: string;
  createdAt: string;
  updatedAt: string;
}

// --- personnel: served from a flat in-memory file, not Firestore (see server/README.md) ---
export interface Personnel {
  name: string;
  phone: string;
  district: string;
  subcounty: string;
  region: string;
}

// --- users/{uid} — mirrors Firebase Auth uid, holds app-level role/profile ---
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

// --- admin_districts/{district}/subcounties/{subcounty}/parishes/{parish}/villages/{village} ---
// Kept flat + denormalized for query simplicity rather than deep subcollections:
export interface AdminUnit {
  id: string;
  name: string;
  level: "district" | "subcounty" | "parish" | "village";
  parentId: string | null;
  region?: string;
  subregion?: string;
}

// --- integration_status/{integrationId} — real health-check results, not mocks ---
export interface IntegrationStatus {
  id: string;
  name: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  lastCheckedAt: string | null;
  lastError?: string;
}

// --- audit_log/{id} ---
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

// --- reports/{id} — real job history for generated reports ---
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
