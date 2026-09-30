import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { db } from "../lib/firebase";
import { slugify } from "../lib/slugify";
import { Household, HouseholdMember, HouseholdLocation, VisitRecord, IncomeBracket } from "../types";

// Transforms the 100-record synthetic dataset (generated separately — see
// data/households_synthetic.json and its embedded `assumptions`/`sources`)
// into this app's real Household shape and seeds them into Firestore.
// That dataset uses a different, more detailed M&E-style schema
// (household_id, members[] with age/sex/relationship only, no names,
// monthly_income_ugx as a number, etc.) — this script is the mapping layer,
// not a second data source. Anything invented here (names, exact risk-level
// thresholds, review-status mix) is called out below; everything else is
// carried over from the already-sourced/assumption-labelled synthetic data.
//
// Writes directly via the Admin SDK (bypasses the Express API and Zod
// validation entirely, same as seedFacilities.ts) — intended to run against
// the local Firestore emulator only (FIRESTORE_EMULATOR_HOST in .env).
//
// Usage: npm run seed:households-synthetic

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
function weighted<T>(rng: () => number, options: [T, number][]): T {
  const total = options.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of options) {
    if (r < w) return v;
    r -= w;
  }
  return options[options.length - 1][0];
}
function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}

// Names weren't part of the synthetic dataset (it only carries age/sex/
// relationship per member) — generated here, deterministically per
// household_id, from the same name pools used elsewhere in this project's
// mock data layer (app/lib/mockGovSources.ts).
const MALE_FIRST = ["David", "Peter", "Moses", "Robert", "Joseph", "Emmanuel", "Geoffrey", "Vincent", "Denis", "Isaac", "Fred", "Charles", "Ibrahim", "Ronald"];
const FEMALE_FIRST = ["Grace", "Sarah", "Betty", "Josephine", "Harriet", "Florence", "Aisha", "Prossy", "Winnie", "Doreen", "Brenda", "Immaculate", "Night", "Patricia"];
const SURNAMES = ["Namutebi", "Byaruhanga", "Okello", "Auma", "Kwikiriza", "Nansubuga", "Odongo", "Businge", "Nakato", "Kirabo", "Aber", "Tumusiime", "Wanyama", "Nalubega"];

// Real county data (see app/lib/countyData.json — same source, duplicated
// here since this is a separate backend package) for the 5 districts this
// dataset uses.
const COUNTY_BY_DISTRICT: Record<string, string[]> = {
  "Kampala City": ["Kampala Capital City"],
  "Wakiso": ["Busiro County", "Entebbe Municipal Council", "Kyadondo County"],
  "Mbale City": ["Mbale Municipal Council"],
  "Gulu": ["Aswa County", "Omoro County"],
  "Mbarara City": ["Mbarara Municipal Council"],
};
// Real district centroids (app/lib/districtCentroids.json) — GPS points are
// jittered around these, same illustrative-approximation approach already
// used in seedFacilities.ts, not surveyed household coordinates.
const CENTROIDS: Record<string, [number, number]> = {
  "Kampala City": [0.31007, 32.5869],
  "Wakiso": [0.21567, 32.51373],
  "Mbale City": [1.00192, 34.19697],
  "Gulu": [3.01862, 32.38848],
  "Mbarara City": [-0.48747, 30.62757],
};

const INCOME_BRACKET_MAP: [number, IncomeBracket][] = [
  [100000, "Under UGX 100,000"],
  [300000, "UGX 100,000–300,000"],
  [700000, "UGX 300,000–700,000"],
  [1500000, "UGX 700,000–1,500,000"],
  [Infinity, "Over UGX 1,500,000"],
];
function bracketFor(ugx: number): IncomeBracket {
  for (const [max, label] of INCOME_BRACKET_MAP) if (ugx < max) return label;
  return "Over UGX 1,500,000";
}

function sanitationIsImproved(text: string): boolean {
  return /slab|vip|ventilated|flush|septic|composting/i.test(text);
}
function waterIsSafe(text: string): boolean {
  return /borehole|tap|protected/i.test(text);
}

const CROPS = ["Maize", "Beans", "Cassava", "Matooke", "Coffee", "Sweet Potatoes", "Groundnuts"];

interface SyntheticMember { age: number; sex: "M" | "F"; relationship_to_head: string }
interface SyntheticRecord {
  household_id: string;
  village_health_team_id: string;
  district: string;
  subcounty: string;
  parish: string;
  village: string;
  head_sex: "M" | "F";
  head_age: number;
  head_occupation: string;
  household_size: number;
  members: SyntheticMember[];
  under_five_count: number;
  pregnant_women_count: number;
  water_source: string;
  sanitation_facility: string;
  monthly_income_ugx: number;
  distance_km: number;
  malaria_episode_last_3m: boolean;
  immunisation_up_to_date: boolean | null;
  chronic_conditions: string[];
  reported_diarrhoea_last_2w: boolean;
}

function transform(rec: SyntheticRecord, daysAgo: number): Household {
  const rng = mulberry32(hashSeed(rec.household_id));
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const nameFor = (sex: "M" | "F") => `${pick(rng, sex === "M" ? MALE_FIRST : FEMALE_FIRST)} ${pick(rng, SURNAMES)}`;
  const headName = nameFor(rec.head_sex);

  let diarrhoeaAssigned = false;
  const householdMembers: HouseholdMember[] = rec.members.map((m, i) => {
    const isHead = i === 0;
    const assignDiarrhoea = rec.reported_diarrhoea_last_2w && m.age < 5 && !diarrhoeaAssigned;
    if (assignDiarrhoea) diarrhoeaAssigned = true;
    const member: HouseholdMember = {
      member_id: `${rec.household_id}-m${i}`,
      name: isHead ? headName : nameFor(m.sex),
      role: m.relationship_to_head,
      age: m.age,
      sex: m.sex,
    };
    if (m.age < 5) member.status = weighted(rng, [["Healthy", 78], ["At-Risk", 15], ["Malnourished", 7]]);
    if (assignDiarrhoea) member.diarrhoeaLast2Weeks = true;
    return member;
  });

  const district_id = slugify(rec.district);
  const subcounty_id = slugify(rec.subcounty);
  const countyOptions = COUNTY_BY_DISTRICT[rec.district];
  const county_id = countyOptions ? slugify(pick(rng, countyOptions)) : undefined;
  const [clat, clng] = CENTROIDS[rec.district] ?? [1.3733, 32.2903];
  const location: HouseholdLocation = {
    district_id,
    county_id,
    subcounty_id,
    parish_id: rec.parish,
    village_id: rec.village,
    latitude: Math.round((clat + (rng() - 0.5) * 0.08) * 10000) / 10000,
    longitude: Math.round((clng + (rng() - 0.5) * 0.08) * 10000) / 10000,
    captured_at: createdAt,
  };

  // Risk level derived from the synthetic record's own real signals, not an
  // independent coin-flip.
  let riskFactors = 0;
  if (rec.malaria_episode_last_3m) riskFactors++;
  if (rec.reported_diarrhoea_last_2w) riskFactors++;
  if (!waterIsSafe(rec.water_source)) riskFactors++;
  if (!sanitationIsImproved(rec.sanitation_facility)) riskFactors++;
  if (rec.chronic_conditions.some((c) => c !== "none")) riskFactors++;
  if (rec.immunisation_up_to_date === false) riskFactors++;
  const riskLevel: Household["riskLevel"] = riskFactors >= 4 ? "Critical" : riskFactors >= 3 ? "High" : riskFactors >= 1 ? "Medium" : "Low";

  const statusParts: string[] = [];
  if (rec.pregnant_women_count > 0) statusParts.push("Pregnant Mother");
  if (rec.malaria_episode_last_3m) statusParts.push("Recent Malaria Episode");
  const chronicReal = rec.chronic_conditions.filter((c) => c !== "none");
  if (chronicReal.length) statusParts.push(chronicReal.join(", "));
  const healthStatus = statusParts.length ? statusParts.join(" · ") : "Stable";

  const consentCaptured = chance(rng, 0.7);
  const program = weighted(rng, [["Routine Monitoring", 55], ["Nutrition Support", 15], ["Cash Transfer", 15], ["WASH Outreach", 15]] as [string, number][]);
  const reviewStatus = weighted(rng, [["approved", 78], ["pending", 17], ["rejected", 5]] as [Household["reviewStatus"], number][]);

  const history: VisitRecord[] = [{
    date: createdAt,
    agent: "Synthetic Seed",
    action: `Initial registration (synthetic dataset; source ${rec.village_health_team_id})`,
    isCritical: riskLevel === "Critical",
  }];

  const household: Household = {
    id: rec.household_id,
    head: headName,
    age: rec.head_age,
    members: rec.household_size,
    under5Count: rec.under_five_count,
    householdMembers,
    location,
    riskLevel,
    healthStatus,
    waterSource: rec.water_source,
    program,
    health: {
      maternal: rec.pregnant_women_count > 0 ? "Pregnant" : "Not pregnant",
      immunization: rec.under_five_count === 0 ? "N/A — no under-5 children" : rec.immunisation_up_to_date ? "Fully Immunized" : "Gaps — pending catch-up",
      chronic: chronicReal.length ? chronicReal.join(", ") : "None",
      consentCaptured,
    },
    wash: {
      waterSource: rec.water_source,
      distance: `${rec.distance_km} km`,
      sanitation: rec.sanitation_facility,
      handwashing: sanitationIsImproved(rec.sanitation_facility) ? "Soap available" : chance(rng, 0.4) ? "Water only, No Soap" : "None",
    },
    livelihoods: {
      incomeSource: rec.head_occupation,
      incomeBracket: bracketFor(rec.monthly_income_ugx),
      crops: /farming/i.test(rec.head_occupation) ? [pick(rng, CROPS), pick(rng, CROPS)].filter((v, i, a) => a.indexOf(v) === i) : [],
      foodSecurity: weighted(rng, [["Food Secure", 45], ["Marginally Secure", 30], ["Stressed", 18], ["Crisis", 7]] as [string, number][]),
    },
    history,
    createdAt,
    createdBy: "seed-script",
    updatedAt: createdAt,
    updatedBy: "seed-script",
    reviewStatus,
    ...(reviewStatus !== "pending" ? { reviewedBy: "seed-script", reviewedByName: "Synthetic Data Seed", reviewedAt: createdAt } : {}),
    ...(reviewStatus === "rejected" ? { rejectionReason: "Synthetic seed record — sample rejection for workflow testing" } : {}),
  };
  return household;
}

async function main() {
  const dataPath = path.join(__dirname, "data", "households_synthetic.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const records: SyntheticRecord[] = raw.households;

  const batch = db.batch();
  records.forEach((rec, i) => {
    const daysAgo = Math.floor((hashSeed(rec.household_id + "|age") % 1800) / 10); // 0-179 days, deterministic
    const household = transform(rec, daysAgo);
    const ref = db.collection("households").doc(household.id);
    batch.set(ref, household);
  });
  await batch.commit();
  console.log(`Seeded ${records.length} synthetic households into Firestore (project: ${process.env.FIREBASE_PROJECT_ID || "village-health-360-dev"}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
