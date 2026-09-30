// Simulated multi-source government/financial lookup layer for the National ID
// registration concept. Nothing here calls a real external system — every
// generator below produces deterministic, clearly-fake data seeded from the
// entered ID so the same ID always previews the same way. This exists to
// demonstrate the intended architecture (tabs, tiers, consent gates, audit
// trail), not to integrate with NIRA/URA/etc.
import { getAllDistricts } from "./adminData";

export type SourceTier = "standard" | "restricted" | "highly-restricted";
export type SourceStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unavailable"
  | "consent-required";
export type IdentityPath = "citizen" | "non-citizen";

export interface KeyValue {
  label: string;
  value: string;
}
export interface SourceRecordGroup {
  title: string;
  fields: KeyValue[];
}
export interface SourceResult {
  fields: KeyValue[];
  records?: SourceRecordGroup[];
  flag?: { level: "info" | "warning" | "critical"; message: string };
}
export interface SourceEnvelope {
  source: string;
  status: SourceStatus;
  data?: SourceResult;
  error?: string;
  fetchedAt?: string;
}

export interface SourceConfig {
  key: string;
  label: string;
  agency: string;
  tier: SourceTier;
  consentNote: string;
  path: IdentityPath | "both";
  isRoot?: boolean;
  ruralOnly?: boolean;
}

export const SOURCES: SourceConfig[] = [
  {
    key: "nira",
    label: "Identity Record",
    agency: "NIRA",
    tier: "standard",
    consentNote: "Root lookup — resolves the NIN to the identity used to query every other source.",
    path: "citizen",
    isRoot: true,
  },
  {
    key: "nira-bd",
    label: "Births & Deaths",
    agency: "NIRA Registry",
    tier: "standard",
    consentNote: "Household composition history — deceased members, birth records for minors (NIN assigned at birth registration; ID card issuance is age-gated separately).",
    path: "citizen",
  },
  {
    key: "crb",
    label: "Financial / CRB",
    agency: "Credit Reference Bureau",
    tier: "restricted",
    consentNote: "Bank accounts, mobile money wallets, and a derived creditworthiness call — not the underlying balances or repayment ledger. Requires explicit, separately-captured subject consent.",
    path: "both",
  },
  {
    key: "moes",
    label: "Education",
    agency: "Ministry of Education & Sports",
    tier: "standard",
    consentNote: "Enrolment history, institutions attended, qualifications.",
    path: "both",
  },
  {
    key: "ura",
    label: "Tax Record",
    agency: "Uganda Revenue Authority",
    tier: "standard",
    consentNote: "TIN status, filing history, compliance flags.",
    path: "both",
  },
  {
    key: "ursb",
    label: "Business Registry",
    agency: "URSB",
    tier: "standard",
    consentNote: "Registered company directorships and shareholdings.",
    path: "both",
  },
  {
    key: "moh",
    label: "Health Record",
    agency: "Ministry of Health",
    tier: "restricted",
    consentNote: "Facility visit history and treatment records. Requires explicit, separately-captured subject consent — separate tier from general registration consent.",
    path: "both",
  },
  {
    key: "mglsd",
    label: "Welfare Programmes",
    agency: "MGLSD",
    tier: "standard",
    consentNote: "Existing beneficiary status across social protection schemes — prevents double-registration.",
    path: "both",
  },
  {
    key: "nssf",
    label: "Employment",
    agency: "NSSF",
    tier: "standard",
    consentNote: "Formal employment history and contribution records — income proxy where URA records are sparse.",
    path: "both",
  },
  {
    key: "nlis",
    label: "Land Titles",
    agency: "Ministry of Lands / NLIS",
    tier: "standard",
    consentNote: "Land titles and ownership records — cross-checked against the homestead GPS pin.",
    path: "both",
  },
  {
    key: "umeme",
    label: "Grid Connection",
    agency: "UMEME",
    tier: "standard",
    consentNote: "Grid connection status — a living-standards proxy for PMT-style scoring.",
    path: "both",
  },
  {
    key: "nwsc",
    label: "Water Connection",
    agency: "NWSC",
    tier: "standard",
    consentNote: "Piped water connection status — same use as grid connection.",
    path: "both",
  },
  {
    key: "police",
    label: "Criminal Record",
    agency: "Uganda Police Force / CID",
    tier: "highly-restricted",
    consentNote: "Requires a distinct statutory vetting legal basis, separate from welfare-registration consent — a welfare tool has no standing to pull this without it.",
    path: "both",
  },
  {
    key: "judiciary",
    label: "Case Status",
    agency: "Judiciary Case Management System",
    tier: "highly-restricted",
    consentNote: "Same statutory vetting caveat as the Police/CID record.",
    path: "both",
  },
  {
    key: "maaif",
    label: "Farmer Registry",
    agency: "MAAIF",
    tier: "standard",
    consentNote: "Farmer registry and subsidy beneficiary status — rural livelihoods households only.",
    path: "both",
    ruralOnly: true,
  },
  {
    key: "dcic",
    label: "Alien / Refugee ID",
    agency: "Directorate of Citizenship & Immigration Control",
    tier: "standard",
    consentNote: "Fallback root identity path for non-citizens (refugees, foreign nationals) where a NIN does not apply.",
    path: "non-citizen",
    isRoot: true,
  },
];

// ---- deterministic PRNG seeded from the entered ID ----
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
// Weighted pick — e.g. weighted(rng, [["no default", 85], ["delinquent", 15]])
// so a minority outcome stays a minority instead of ~50/50 coin-flip noise.
function weighted<T>(rng: () => number, options: [T, number][]): T {
  const total = options.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [value, w] of options) {
    if (r < w) return value;
    r -= w;
  }
  return options[options.length - 1][0];
}
function chance(rng: () => number, probability: number): boolean {
  return rng() < probability;
}
function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}
function digits(rng: () => number, len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += Math.floor(rng() * 10);
  return out;
}

const MALE_FIRST = ["David", "Peter", "John", "Moses", "Robert", "Joseph", "Ronald", "Ibrahim", "Emmanuel", "Geoffrey", "Vincent", "Denis", "Patrick", "Isaac"];
const FEMALE_FIRST = ["Grace", "Sarah", "Patricia", "Betty", "Josephine", "Immaculate", "Harriet", "Florence", "Aisha", "Night", "Prossy", "Winnie", "Doreen", "Brenda"];
const SURNAMES = ["Ssemwogerere", "Nabwiso", "Akena", "Byaruhanga", "Mugisha", "Tumusiime", "Wanyama", "Kato", "Ochieng", "Nansubuga", "Kirabo", "Atim", "Okot", "Namutebi", "Businge", "Nakato", "Odongo", "Aber", "Kwikiriza", "Nalubega"];
const RELATIONS: [string, number][] = [["Spouse", 45], ["Sibling", 20], ["Parent", 15], ["Adult Child", 12], ["Cousin", 8]];

type Tier = "informal-low" | "informal-mid" | "formal-low" | "formal-mid" | "formal-high";
const CURRENT_YEAR = 2026;

interface EduLevel {
  label: string;
  completeAge: number;
  tiers: Tier[];
}
const EDU_LEVELS: EduLevel[] = [
  { label: "No formal schooling", completeAge: 0, tiers: ["informal-low"] },
  { label: "Primary (P7)", completeAge: 13, tiers: ["informal-low", "informal-mid"] },
  { label: "O-Level (S4)", completeAge: 17, tiers: ["informal-low", "informal-mid", "formal-low"] },
  { label: "A-Level (S6)", completeAge: 19, tiers: ["informal-mid", "formal-low", "formal-mid"] },
  { label: "Certificate", completeAge: 20, tiers: ["formal-low", "formal-mid"] },
  { label: "Diploma", completeAge: 21, tiers: ["formal-low", "formal-mid"] },
  { label: "Bachelor's Degree", completeAge: 23, tiers: ["formal-mid", "formal-high"] },
  { label: "Postgraduate", completeAge: 26, tiers: ["formal-high"] },
];
const UNIVERSITIES = ["Makerere University", "Kyambogo University", "Gulu University", "Uganda Christian University", "Mbarara University of Science & Technology"];
const INSTITUTES = ["Uganda Technical College", "Nakawa Vocational Training Institute", "Kampala Business & Technical Institute"];

// Full trajectory beneath each highest-attained level, so the education tab
// shows every stage (nursery through tertiary) rather than just the final
// qualification. Ages line up with standard Uganda progression; end age of
// the final stage matches the corresponding EDU_LEVELS.completeAge exactly.
interface TrajectoryStage {
  label: "Nursery" | "Primary" | "O-Level" | "A-Level" | "Tertiary";
  startAge: number;
  endAge: number;
}
const TRAJECTORY_STAGES: Record<string, TrajectoryStage[]> = {
  "No formal schooling": [],
  "Primary (P7)": [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
  ],
  "O-Level (S4)": [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
  ],
  "A-Level (S6)": [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
    { label: "A-Level", startAge: 18, endAge: 19 },
  ],
  // Technical certificates commonly admit straight from O-Level.
  Certificate: [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
    { label: "Tertiary", startAge: 18, endAge: 20 },
  ],
  Diploma: [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
    { label: "A-Level", startAge: 18, endAge: 19 },
    { label: "Tertiary", startAge: 20, endAge: 21 },
  ],
  "Bachelor's Degree": [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
    { label: "A-Level", startAge: 18, endAge: 19 },
    { label: "Tertiary", startAge: 20, endAge: 23 },
  ],
  Postgraduate: [
    { label: "Nursery", startAge: 3, endAge: 5 },
    { label: "Primary", startAge: 6, endAge: 13 },
    { label: "O-Level", startAge: 14, endAge: 17 },
    { label: "A-Level", startAge: 18, endAge: 19 },
    { label: "Tertiary", startAge: 20, endAge: 26 },
  ],
};
const LEVEL_CERTIFICATE_TAG: Record<string, string> = {
  Nursery: "Completed",
  Primary: "Primary Leaving Examinations (PLE)",
  "O-Level": "Uganda Certificate of Education (UCE)",
  "A-Level": "Uganda Advanced Certificate of Education (UACE)",
};
const FIELDS_OF_STUDY = ["Business Administration", "Education", "Agriculture", "Information Technology", "Social Sciences", "Nursing", "Civil Engineering", "Accounting & Finance"];
function formatAward(highestLevel: string, field: string): string {
  switch (highestLevel) {
    case "Certificate": return `Certificate in ${field}`;
    case "Diploma": return `Diploma in ${field}`;
    case "Bachelor's Degree": return `Bachelor of ${field}`;
    case "Postgraduate": return `Postgraduate Diploma in ${field}`;
    default: return highestLevel;
  }
}

const EMPLOYERS: Record<Tier, string[]> = {
  "informal-low": ["Self-employed (informal — no contributions)", "Casual/day labour (informal)", "Subsistence farming (informal)"],
  "informal-mid": ["Self-employed (informal — no contributions)", "Boda boda / transport trade (informal)", "Small retail trade (informal)"],
  "formal-low": ["{district} Local Government", "Primary/Secondary School (Teacher)", "Local retail chain"],
  "formal-mid": ["Centenary Bank", "MTN Uganda", "Regional agro-processing company"],
  "formal-high": ["Stanbic Bank Uganda", "Uganda Breweries Ltd", "Umeme Ltd", "Ministry Headquarters (Senior Officer)"],
};
const BANKS = ["Centenary Bank", "Stanbic Bank Uganda", "Equity Bank Uganda", "DFCU Bank", "Post Bank Uganda"];

export interface HomeLocation {
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
}
// The NIRA identity record's registered address, used to autofill the
// household registration form's Location section. Seeded only from
// district+subcounty combinations that fully resolve against this app's own
// admin-hierarchy reference data (adminData.ts) — most of the country has no
// sourced parish data (see DATA_SOURCES.md), so picking from anywhere wider
// would make the autofill fail its own relational validation most of the
// time. This is separate from the broader `district` used elsewhere in the
// profile for institution/facility flavor text, which doesn't need to
// resolve against a reference table.
const HOME_LOCATIONS: HomeLocation[] = [
  { district: "Wakiso", county: "Kyadondo County", subcounty: "Kira Division", parish: "Kimwanyi", village: "Kimwanyi Trading Center" },
  { district: "Gulu", county: "Aswa County", subcounty: "Awach", parish: "Gwengdiya", village: "Gwengdiya Center" },
];

export interface ResolvedIdentity {
  name: string;
  sex: "Male" | "Female";
  dob: string;
  age: number;
  nextOfKin: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  homeLocation: HomeLocation;
}

interface LifeProfile extends ResolvedIdentity {
  firstName: string;
  lastName: string;
  district: string;
  rural: boolean;
  tier: Tier;
  educationLevel: string;
  educationEndYear: number;
  institution: string;
  employed: boolean;
  employer: string | null;
  employmentStartYear: number | null;
  hasTin: boolean;
  compliant: string;
  hasLoan: boolean;
  loanAmount: number;
  repaymentStanding: string;
  creditRisk: "Safe to lend" | "High risk";
  hasCompany: boolean;
  hasTitle: boolean;
}

// Every field below is derived from a single seeded RNG stream keyed only on
// the entered ID, so the same synthetic person is consistent across every
// tab (age vs. education timeline, employer vs. tax/credit profile, etc.)
// instead of each source independently re-rolling its own version of them.
function buildProfile(id: string): LifeProfile {
  const rng = mulberry32(hashSeed(id));
  const districts = getAllDistricts();

  const sex: "Male" | "Female" = chance(rng, 0.5) ? "Male" : "Female";
  const firstName = pick(rng, sex === "Male" ? MALE_FIRST : FEMALE_FIRST);
  const lastName = pick(rng, SURNAMES);
  const age = 24 + Math.floor(rng() * 45);
  const birthYear = CURRENT_YEAR - age;
  const dob = `${birthYear}-${pad(1 + Math.floor(rng() * 12))}-${pad(1 + Math.floor(rng() * 28))}`;

  const district = pick(rng, districts.length ? districts : ["Gulu", "Masaka", "Mbale"]);
  const rural = chance(rng, 0.65);

  // Uganda skews rural/informal; weight the tier distribution accordingly
  // rather than spreading it evenly across five buckets.
  const tier: Tier = rural
    ? weighted(rng, [["informal-low", 45], ["informal-mid", 30], ["formal-low", 15], ["formal-mid", 8], ["formal-high", 2]])
    : weighted(rng, [["informal-low", 15], ["informal-mid", 25], ["formal-low", 25], ["formal-mid", 22], ["formal-high", 13]]);

  const eligibleLevels = EDU_LEVELS.filter((l) => l.tiers.includes(tier) && l.completeAge <= age);
  const level = eligibleLevels.length ? pick(rng, eligibleLevels) : EDU_LEVELS[0];
  const educationEndYear = Math.min(CURRENT_YEAR, birthYear + level.completeAge);
  const institution =
    level.completeAge >= 23
      ? pick(rng, UNIVERSITIES)
      : level.completeAge >= 20
      ? pick(rng, INSTITUTES)
      : level.completeAge >= 17
      ? "St. " + district + " Secondary School"
      : district + " Core Primary School";

  const employed = tier.startsWith("formal");
  const employer = employed ? pick(rng, EMPLOYERS[tier]).replace("{district}", district) : null;
  const employmentStartYear = employed ? Math.min(CURRENT_YEAR, educationEndYear + 1 + Math.floor(rng() * 3)) : null;

  const directorshipProbability: Record<Tier, number> = { "informal-low": 0.02, "informal-mid": 0.06, "formal-low": 0.08, "formal-mid": 0.18, "formal-high": 0.3 };
  const hasCompany = chance(rng, directorshipProbability[tier]);

  // URA's presumptive-tax regime reaches most informal traders too, not just
  // formal employees — the taxpayer profile should read as populated by
  // default rather than mostly N/A. A registered company director is
  // required to hold a TIN, so directorship forces registration regardless
  // of the coin-flip — a director with no tax record at all would be the
  // kind of cross-tab contradiction this dataset is meant to avoid.
  const hasTin = hasCompany || (employed ? chance(rng, 0.92) : chance(rng, 0.55));
  const compliant = hasTin ? weighted(rng, [["Compliant", 78], ["Overdue filing — 1 period", 17], ["Overdue filing — 2+ periods", 5]]) : "N/A";

  const loanProbability: Record<Tier, number> = { "informal-low": 0.12, "informal-mid": 0.28, "formal-low": 0.42, "formal-mid": 0.52, "formal-high": 0.4 };
  const loanRange: Record<Tier, [number, number]> = {
    "informal-low": [50000, 300000],
    "informal-mid": [150000, 900000],
    "formal-low": [500000, 3000000],
    "formal-mid": [1000000, 8000000],
    "formal-high": [3000000, 30000000],
  };
  const hasLoan = chance(rng, loanProbability[tier]);
  const [lo, hi] = loanRange[tier];
  const loanAmount = hasLoan ? Math.round((lo + rng() * (hi - lo)) / 10000) * 10000 : 0;

  // Repayment history and the resulting "safe to lend" call are derived here
  // (once, from the shared seed) rather than as an independent per-tab
  // coin-flip — the bureau-style summary is exposed on the CRB tab, the
  // ledger it comes from is not.
  const repaymentStanding = hasLoan
    ? weighted(rng, [["Performing", 70], ["Watch — 1 missed instalment", 22], ["Delinquent — 2+ missed instalments", 8]])
    : "N/A";
  const highRiskBaseProbability: Record<Tier, number> = { "informal-low": 0.35, "informal-mid": 0.22, "formal-low": 0.12, "formal-mid": 0.07, "formal-high": 0.04 };
  let highRisk = chance(rng, highRiskBaseProbability[tier]);
  if (repaymentStanding.startsWith("Delinquent")) highRisk = true;
  if (repaymentStanding === "Performing" && (tier === "formal-mid" || tier === "formal-high")) highRisk = false;
  const creditRisk: "Safe to lend" | "High risk" = highRisk ? "High risk" : "Safe to lend";

  const titleProbability: Record<Tier, number> = { "informal-low": 0.08, "informal-mid": 0.18, "formal-low": 0.3, "formal-mid": 0.45, "formal-high": 0.6 };
  const hasTitle = age >= 25 && chance(rng, titleProbability[tier]);

  const nextOfKinRelation = weighted(rng, RELATIONS);
  // A spouse is always recorded as the opposite sex of the household head.
  const kinSex: "Male" | "Female" = nextOfKinRelation === "Spouse" ? (sex === "Male" ? "Female" : "Male") : chance(rng, 0.5) ? "Male" : "Female";
  // Exclude the head's own first name so same-sex relatives (sibling,
  // parent, etc.) never come back identically named to the head.
  const kinPool = (kinSex === "Male" ? MALE_FIRST : FEMALE_FIRST).filter((n) => n !== firstName);
  const kinFirst = pick(rng, kinPool.length ? kinPool : (kinSex === "Male" ? MALE_FIRST : FEMALE_FIRST));
  const kinLast = chance(rng, 0.5) ? lastName : pick(rng, SURNAMES);

  const homeLocation = pick(rng, HOME_LOCATIONS);

  return {
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    sex,
    dob,
    age,
    homeLocation,
    district,
    rural,
    tier,
    educationLevel: level.label,
    educationEndYear,
    institution,
    employed,
    employer,
    employmentStartYear,
    hasTin,
    compliant,
    hasLoan,
    loanAmount,
    repaymentStanding,
    creditRisk,
    hasCompany,
    hasTitle,
    nextOfKin: `${kinFirst} ${kinLast}`,
    nextOfKinRelation,
    nextOfKinPhone: `+256 7${Math.floor(rng() * 9)}${pad(Math.floor(rng() * 10000000), 7)}`,
  };
}

export function resolveIdentity(id: string): ResolvedIdentity {
  const { name, sex, dob, age, nextOfKin, nextOfKinRelation, nextOfKinPhone, homeLocation } = buildProfile(id);
  return { name, sex, dob, age, nextOfKin, nextOfKinRelation, nextOfKinPhone, homeLocation };
}

// `detail` is a per-source RNG for flourishes that don't need to agree across
// tabs (which specific bank, which specific plot number). Every fact that a
// real reviewer could cross-check between tabs — age, district, tier,
// employer, tax/credit/land status — comes from the shared profile instead.
function generateSourceData(key: string, profile: LifeProfile, detail: () => number): SourceResult {
  const { district, tier } = profile;

  switch (key) {
    case "nira":
      return {
        fields: [
          { label: "Full Name", value: profile.name },
          { label: "Sex", value: profile.sex },
          { label: "Date of Birth", value: profile.dob },
          { label: "Nationality", value: "Ugandan" },
          { label: "District", value: profile.homeLocation.district },
          { label: "County", value: profile.homeLocation.county },
          { label: "Subcounty", value: profile.homeLocation.subcounty },
          { label: "Parish", value: profile.homeLocation.parish },
          { label: "Village", value: profile.homeLocation.village },
          { label: "Next of Kin", value: `${profile.nextOfKin} (${profile.nextOfKinRelation})` },
          { label: "Next of Kin Phone", value: profile.nextOfKinPhone },
          { label: "NIN Status", value: "Active" },
        ],
      };
    case "nira-bd": {
      // Minors can only exist if the head was old enough (18+) to have had
      // them, and their birth years have to fit inside the head's own
      // lifetime and still be under 18 today.
      const birthYear = CURRENT_YEAR - profile.age;
      // Fathers can plausibly have young children into old age; mothers
      // can't — cap the window so an elderly female head doesn't get a
      // biologically implausible recent birth record.
      const maxParentAge = profile.sex === "Female" ? 45 : 65;
      const earliestChildYear = Math.max(birthYear + 18, CURRENT_YEAR - 17);
      const latestChildYear = Math.min(CURRENT_YEAR - 1, birthYear + maxParentAge);
      const childWindowValid = latestChildYear >= earliestChildYear;
      const maxMinors = !childWindowValid ? 0 : profile.age >= 20 ? 3 : profile.age >= 18 ? 1 : 0;
      const minorWeights: [number, number][] = [[0, 45], [1, 25], [2, 20], [3, 10]];
      const minorCount = maxMinors === 0 ? 0 : weighted(detail, minorWeights.slice(0, maxMinors + 1));
      const childYearSpan = Math.max(1, latestChildYear - earliestChildYear);
      const records: SourceRecordGroup[] = [];
      for (let i = 0; i < minorCount; i++) {
        const mSex = chance(detail, 0.5) ? "Male" : "Female";
        const childYear = earliestChildYear + Math.floor(detail() * childYearSpan);
        const childAge = CURRENT_YEAR - childYear;
        // NIN is assigned at birth registration in Uganda — it's the
        // physical ID card, not the number itself, that's age-gated (16+).
        const childNin = `${mSex === "Male" ? "CM" : "CF"}${digits(detail, 10)}`;
        records.push({
          title: `Birth Record — Minor ${i + 1}`,
          fields: [
            { label: "Name", value: `${pick(detail, mSex === "Male" ? MALE_FIRST : FEMALE_FIRST)} ${profile.lastName}` },
            { label: "Sex", value: mSex },
            { label: "Date of Birth", value: `${childYear}-${pad(1 + Math.floor(detail() * 12))}-${pad(1 + Math.floor(detail() * 28))}` },
            { label: "NIN", value: childNin },
            { label: "ID Card Status", value: childAge >= 16 ? "Eligible — not yet collected" : "Not yet issued — under 16" },
          ],
        });
      }
      if (chance(detail, 0.1)) {
        // A "Spouse" is only offered here if the head doesn't already have a
        // living spouse as next of kin, and is always the opposite sex.
        const deathRelationOptions = profile.nextOfKinRelation === "Spouse" ? RELATIONS.filter(([r]) => r !== "Spouse") : RELATIONS;
        const deathRelation = weighted(detail, deathRelationOptions);
        const deathSex: "Male" | "Female" = deathRelation === "Spouse" ? (profile.sex === "Male" ? "Female" : "Male") : chance(detail, 0.5) ? "Male" : "Female";
        records.push({
          title: "Death Record",
          fields: [
            { label: "Name", value: `${pick(detail, deathSex === "Male" ? MALE_FIRST : FEMALE_FIRST)} ${profile.lastName}` },
            { label: "Relation", value: deathRelation },
            { label: "Date of Death", value: `${2018 + Math.floor(detail() * 8)}-${pad(1 + Math.floor(detail() * 12))}-${pad(1 + Math.floor(detail() * 28))}` },
          ],
        });
      }
      return {
        fields: [{ label: "Household Composition Records Found", value: String(records.length) }],
        records: records.length ? records : undefined,
      };
    }
    case "crb": {
      // Bureau-style summary: the accounts on record and the derived
      // creditworthiness call are shown. Balances, loan amounts and the raw
      // repayment ledger behind that call are not — same as a real CRB
      // disclosure product (score visible, underlying ledger not).
      const hasBankAccount = tier === "informal-low" ? chance(detail, 0.2) : tier === "informal-mid" ? chance(detail, 0.45) : chance(detail, 0.9);
      const hasMobileMoney = chance(detail, 0.85);
      const accounts: SourceRecordGroup[] = [];
      if (hasBankAccount) {
        const numAccounts = chance(detail, 0.25) ? 2 : 1;
        for (let i = 0; i < numAccounts; i++) {
          const bank = profile.employer && BANKS.includes(profile.employer) && chance(detail, 0.7) ? profile.employer : pick(detail, BANKS);
          accounts.push({
            title: bank,
            fields: [
              { label: "Account Number", value: `****${digits(detail, 4)}` },
              { label: "Account Type", value: weighted(detail, [["Savings", 55], ["Current", 45]]) },
            ],
          });
        }
      }
      if (hasMobileMoney) {
        accounts.push({
          title: weighted(detail, [["MTN MoMo", 55], ["Airtel Money", 45]]),
          fields: [
            { label: "Account Number", value: `****${digits(detail, 4)}` },
            { label: "Account Type", value: "Mobile Money Wallet" },
          ],
        });
      }
      return {
        fields: [
          { label: "Accounts on Record", value: accounts.length ? String(accounts.length) : "None" },
          { label: "Creditworthiness", value: profile.creditRisk },
        ],
        records: accounts.length ? accounts : undefined,
        flag: profile.creditRisk === "High risk" ? { level: "warning", message: "Derived from repayment history and transaction activity — factor into vulnerability scoring." } : undefined,
      };
    }
    case "moes": {
      const attended = profile.educationLevel !== "No formal schooling";
      if (!attended) {
        return { fields: [{ label: "Highest Qualification", value: "No formal schooling" }, { label: "Institution", value: "N/A" }] };
      }

      const birthYear = CURRENT_YEAR - profile.age;
      const nurserySchool = district + " Nursery School";
      const primarySchool = district + " Core Primary School";
      const secondarySchool = "St. " + district + " Secondary School";

      let fieldWeights: [string, number][] = FIELDS_OF_STUDY.map((f) => [f, 1]);
      if (profile.employer === "Primary/Secondary School (Teacher)") {
        fieldWeights = FIELDS_OF_STUDY.map((f) => [f, f === "Education" ? 12 : 1]);
      } else if (profile.employer && BANKS.includes(profile.employer)) {
        fieldWeights = FIELDS_OF_STUDY.map((f) => [f, f === "Accounting & Finance" || f === "Business Administration" ? 6 : 1]);
      } else if (profile.rural) {
        fieldWeights = FIELDS_OF_STUDY.map((f) => [f, f === "Agriculture" ? 6 : 1]);
      }
      const fieldOfStudy = weighted(detail, fieldWeights);

      const stages = TRAJECTORY_STAGES[profile.educationLevel] ?? [];
      const records: SourceRecordGroup[] = stages.map((stage) => {
        const institution =
          stage.label === "Nursery" ? nurserySchool :
          stage.label === "Primary" ? primarySchool :
          stage.label === "O-Level" || stage.label === "A-Level" ? secondarySchool :
          profile.institution;
        const fields: KeyValue[] = [
          { label: "Institution", value: institution },
          { label: "Start Year", value: String(birthYear + stage.startAge) },
          { label: "End Year", value: String(birthYear + stage.endAge) },
        ];
        if (stage.label === "Tertiary") {
          fields.push({ label: "Qualification", value: formatAward(profile.educationLevel, fieldOfStudy) });
          fields.push({ label: "Field of Study", value: fieldOfStudy });
        } else {
          fields.push({ label: "Level Attained", value: LEVEL_CERTIFICATE_TAG[stage.label] });
        }
        return { title: stage.label === "Tertiary" ? profile.educationLevel : stage.label, fields };
      });

      const isTertiary = stages.some((s) => s.label === "Tertiary");
      return {
        fields: [
          { label: "Highest Qualification", value: profile.educationLevel },
          { label: "Field of Study", value: isTertiary ? fieldOfStudy : "N/A" },
          { label: "Institution", value: profile.institution },
          { label: "Completion Year", value: String(profile.educationEndYear) },
        ],
        records,
      };
    }
    case "ura": {
      const taxBracket = !profile.hasTin
        ? "N/A"
        : !profile.employed
        ? "Presumptive Tax (Small Business)"
        : tier === "formal-low"
        ? "PAYE — Lower Band"
        : tier === "formal-mid"
        ? "PAYE — Middle Band"
        : "PAYE — Upper Band";
      return {
        fields: [
          { label: "TIN Status", value: profile.hasTin ? "Registered" : "Not registered" },
          { label: "TIN", value: profile.hasTin ? `10${digits(detail, 8)}` : "N/A" },
          { label: "Return Type", value: profile.hasTin ? (profile.hasCompany ? "Business" : "Individual") : "N/A" },
          { label: "Tax Bracket", value: taxBracket },
          { label: "Filing History", value: profile.hasTin ? `${1 + Math.floor(detail() * 6)} returns filed` : "N/A" },
          { label: "Compliance Flag", value: profile.compliant },
        ],
        flag: profile.compliant.startsWith("Overdue") ? { level: "warning", message: "Outstanding tax filings on record." } : undefined,
      };
    }
    case "ursb": {
      return {
        fields: [{ label: "Registered Directorships", value: profile.hasCompany ? "1 company on record" : "None" }],
        records: profile.hasCompany
          ? [
              {
                title: `${district} ${pick(detail, ["Traders", "Agro Supplies", "General Merchandise", "Enterprises"])} Ltd`,
                fields: [
                  { label: "Role", value: weighted(detail, [["Director", 50], ["Shareholder — 100%", 20], ["Shareholder — 50%", 30]]) },
                  { label: "Status", value: "Active" },
                ],
              },
            ]
          : undefined,
      };
    }
    case "moh": {
      const visits = profile.rural ? Math.floor(detail() * 3) : 1 + Math.floor(detail() * 4);
      const chronic = profile.age >= 50 ? chance(detail, 0.3) : chance(detail, 0.08);
      return {
        fields: [
          { label: "Registered Facility", value: district + " Health Centre " + (profile.rural ? "III" : "IV") },
          { label: "Visits (last 12 months)", value: String(visits) },
          { label: "Chronic Condition Flag", value: chronic ? weighted(detail, [["Hypertension — under management", 60], ["Diabetes — under management", 40]]) : "None recorded" },
          { label: "Linked Family Members", value: String(Math.floor(detail() * 4)) + " linked records" },
        ],
      };
    }
    case "mglsd": {
      const beneficiaryProbability: Record<Tier, number> = { "informal-low": 0.32, "informal-mid": 0.15, "formal-low": 0.05, "formal-mid": 0.02, "formal-high": 0.01 };
      const enrolled = chance(detail, beneficiaryProbability[tier]);
      const programmes = ["SAGE (Senior Citizens Grant)", "UWEP (Uganda Women Entrepreneurship Programme)", "YLP (Youth Livelihood Programme)", "DRDIP"];
      return {
        fields: [
          { label: "Existing Beneficiary", value: enrolled ? "Yes" : "No" },
          { label: "Programme(s)", value: enrolled ? pick(detail, programmes) : "None on record" },
        ],
        flag: enrolled ? { level: "warning", message: "Already enrolled in a social protection scheme — check for double-registration before approving." } : undefined,
      };
    }
    case "nssf":
      return {
        fields: [
          { label: "Employment Type", value: profile.employed ? "Formal" : "Informal" },
          { label: "Employer on Record", value: profile.employer ?? "Self-employed (informal — no contributions)" },
          { label: "Membership Number", value: profile.employed ? `NSSF/UG/7${digits(detail, 8)}` : "N/A" },
          { label: "Contribution History", value: profile.employmentStartYear ? `${CURRENT_YEAR - profile.employmentStartYear} years (since ${profile.employmentStartYear})` : "None" },
        ],
      };
    case "nlis":
      return {
        fields: [
          { label: "Registered Title Found", value: profile.hasTitle ? "Yes" : "No" },
          { label: "GPS Cross-Check", value: profile.hasTitle ? weighted(detail, [["Matches homestead pin", 70], ["≈450m from homestead pin — review", 30]]) : "No title to cross-check" },
        ],
        records: profile.hasTitle
          ? [
              {
                title: `${district.toUpperCase()}-BLOCK-${100 + Math.floor(detail() * 300)}-PLOT-${1 + Math.floor(detail() * 40)}`,
                fields: [
                  { label: "Tenure", value: weighted(detail, [["Mailo", 30], ["Freehold", 25], ["Leasehold", 15], ["Customary (unregistered)", 30]]) },
                  { label: "Registered Owner", value: profile.name },
                  { label: "Size", value: `${(0.5 + detail() * 4).toFixed(1)} acres` },
                ],
              },
            ]
          : undefined,
      };
    case "umeme": {
      const connected = profile.rural ? chance(detail, 0.4) : chance(detail, 0.85);
      return {
        fields: [
          { label: "Grid Connection", value: connected ? "Connected — prepaid meter" : "Not connected" },
          // Yaka prepaid meter numbers are 11 digits.
          { label: "Yaka Meter Number", value: connected ? digits(detail, 11) : "N/A" },
          { label: "Account Status", value: connected ? "Active" : "N/A" },
        ],
      };
    }
    case "nwsc": {
      const connected = profile.rural ? chance(detail, 0.15) : chance(detail, 0.7);
      return {
        fields: [
          { label: "Piped Water Connection", value: connected ? "Connected" : "Not connected — relies on borehole/protected spring" },
          { label: "Meter Number", value: connected ? digits(detail, 8) : "N/A" },
        ],
      };
    }
    case "police": {
      const hasRecord = chance(detail, 0.08);
      return {
        fields: [
          { label: "Record Found", value: hasRecord ? "Yes" : "No record on file" },
          { label: "Status", value: hasRecord ? weighted(detail, [["Case closed — no conviction", 65], ["Pending investigation", 35]]) : "N/A" },
        ],
        records: hasRecord
          ? [
              {
                title: pick(detail, ["Theft (petty)", "Public disturbance", "Assault (minor)"]),
                fields: [
                  { label: "Station", value: district + " Central Police Station" },
                  { label: "Date Filed", value: `${2019 + Math.floor(detail() * 7)}-${pad(1 + Math.floor(detail() * 12))}-${pad(1 + Math.floor(detail() * 28))}` },
                  { label: "Outcome", value: weighted(detail, [["Dismissed", 40], ["Case closed — no conviction", 40], ["Under investigation", 20]]) },
                ],
              },
            ]
          : undefined,
      };
    }
    case "judiciary": {
      // Land or debt exposure make a civil suit more plausible — another
      // cross-tab correlation instead of an independent coin-flip.
      let p = 0.05;
      if (profile.hasTitle) p += 0.08;
      if (profile.hasLoan) p += 0.06;
      const hasCase = chance(detail, p);
      return {
        fields: [{ label: "Active Case", value: hasCase ? "Yes" : "None on file" }],
        records: hasCase
          ? [
              {
                title: `Civil Suit No. ${100 + Math.floor(detail() * 900)}/${2022 + Math.floor(detail() * 4)}`,
                fields: [
                  { label: "Court", value: district + " Chief Magistrate's Court" },
                  { label: "Nature", value: profile.hasTitle && chance(detail, 0.6) ? "Land dispute" : weighted(detail, [["Debt recovery", 50], ["Family matter", 50]]) },
                  { label: "Status", value: weighted(detail, [["Ongoing", 40], ["Adjourned", 30], ["Ruling pending", 30]]) },
                ],
              },
            ]
          : undefined,
      };
    }
    case "maaif": {
      const registered = profile.rural ? chance(detail, 0.55) : chance(detail, 0.05);
      const category = registered ? weighted(detail, [["Coffee", 25], ["Maize", 25], ["Dairy cattle", 15], ["Poultry", 15], ["Beans", 20]]) : "N/A";
      const isLivestock = category === "Dairy cattle" || category === "Poultry";
      return {
        fields: [
          { label: "Farmer Registry Status", value: registered ? "Registered" : "Not registered" },
          { label: "Registry ID", value: registered ? `${district.slice(0, 3).toUpperCase()}-FR-${digits(detail, 6)}` : "N/A" },
          { label: "Crop/Livestock Category", value: category },
          { label: "Land Under Cultivation", value: registered && !isLivestock ? `${(0.5 + detail() * 3).toFixed(1)} acres` : "N/A" },
          { label: "Subsidy Beneficiary", value: registered ? (chance(detail, 0.35) ? "Yes — seed input programme" : "No") : "N/A" },
        ],
      };
    }
    case "dcic": {
      const type = weighted(detail, [["Refugee ID", 55], ["Work Permit", 30], ["Student Permit", 15]]);
      return {
        fields: [
          { label: "Full Name", value: profile.name },
          { label: "Document Type", value: type },
          { label: "Nationality", value: weighted(detail, [["South Sudanese", 35], ["Congolese (DRC)", 30], ["Kenyan", 15], ["Rwandan", 12], ["Burundian", 8]]) },
          { label: "Status", value: "Valid" },
          { label: "Expiry Date", value: `2027-${pad(1 + Math.floor(detail() * 12))}-${pad(1 + Math.floor(detail() * 28))}` },
          ...(type === "Refugee ID" ? [{ label: "Settlement", value: pick(detail, ["Bidi Bidi", "Kyaka II", "Nakivale", "Rhino Camp"]) }] : []),
        ],
      };
    }
    default:
      return { fields: [] };
  }
}

export async function simulateFetch(key: string, id: string): Promise<SourceEnvelope> {
  const latencyRng = mulberry32(hashSeed(key + "|latency|" + id));
  const delay = 350 + Math.floor(latencyRng() * 1600);
  await new Promise((res) => setTimeout(res, delay));

  const roll = latencyRng();
  if (roll > 0.94) {
    return { source: key, status: "unavailable", error: "Source did not respond within the timeout window." };
  }
  if (roll > 0.9) {
    return { source: key, status: "error", error: "Circuit breaker open — repeated failures from this source." };
  }
  const profile = buildProfile(id);
  const detail = mulberry32(hashSeed(key + "|detail|" + id));
  return {
    source: key,
    status: "success",
    data: generateSourceData(key, profile, detail),
    fetchedAt: new Date().toISOString(),
  };
}
