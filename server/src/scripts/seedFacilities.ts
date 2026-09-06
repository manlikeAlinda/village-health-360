import "dotenv/config";
import { db } from "../lib/firebase";
import { Facility } from "../types";

// Seeds a modest, realistic set of facilities so the map has real data to query.
// Coordinates are illustrative approximations (jittered around each district's
// real town center) rather than surveyed GPS points for actual infrastructure —
// there is no public facility-location dataset wired up yet. Real subcounty
// names are used (see DATA_SOURCES.md) so at least the administrative
// attribution is accurate, even though exact placement isn't survey-grade.
//
// Usage: npm run seed:facilities

const now = new Date().toISOString();

const facilities: Omit<Facility, "id" | "createdAt" | "updatedAt">[] = [
  // Gulu district (Patiko/Bungatira area used throughout the app's existing demo narrative)
  { type: "borehole", name: "Patiko Trading Center Borehole", district: "Gulu", subcounty: "Patiko", village: "Bwobo", lat: 2.7746, lng: 32.2882, status: "functional" },
  { type: "borehole", name: "Bungatira Borehole 2", district: "Gulu", subcounty: "Bungatira", village: "Ajulu", lat: 2.7801, lng: 32.2921, status: "functional" },
  { type: "protected_spring", name: "Odek Road Spring", district: "Gulu", subcounty: "Patiko", village: "Koro", lat: 2.7683, lng: 32.2839, status: "broken" },
  { type: "tap_stand", name: "Layibi Tap Stand", district: "Gulu", subcounty: "Paicho", village: "Layibi", lat: 2.7712, lng: 32.2967, status: "functional" },
  { type: "rain_tank", name: "Patiko Primary School Tank", district: "Gulu", subcounty: "Patiko", village: "Patiko Center", lat: 2.7729, lng: 32.2903, status: "functional" },
  { type: "health_center", name: "Patiko Health Center III", district: "Gulu", subcounty: "Patiko", village: "Patiko Center", lat: 2.7738, lng: 32.2895, status: "functional" },
  { type: "health_center", name: "Bungatira Health Center II", district: "Gulu", subcounty: "Bungatira", village: "Ajulu", lat: 2.7815, lng: 32.2934, status: "functional" },
  { type: "school", name: "Patiko Primary School", district: "Gulu", subcounty: "Patiko", village: "Patiko Center", lat: 2.7727, lng: 32.2899, status: "functional" },
  { type: "school", name: "Bwobo Primary School", district: "Gulu", subcounty: "Patiko", village: "Bwobo", lat: 2.7753, lng: 32.2875, status: "functional" },
  { type: "latrine", name: "Patiko Trading Center VIP Latrine", district: "Gulu", subcounty: "Patiko", village: "Patiko Center", lat: 2.7741, lng: 32.2891, status: "functional" },
  { type: "latrine", name: "Koro Market Latrine", district: "Gulu", subcounty: "Patiko", village: "Koro", lat: 2.7678, lng: 32.2844, status: "broken" },

  // Kampala City (Central Division) for geographic diversity
  { type: "tap_stand", name: "Nakivubo Tap Stand", district: "Kampala City", subcounty: "Central Division", lat: 0.3163, lng: 32.5822, status: "functional" },
  { type: "health_center", name: "Kisenyi Health Center IV", district: "Kampala City", subcounty: "Central Division", lat: 0.3129, lng: 32.5745, status: "functional" },
  { type: "school", name: "Old Kampala Primary School", district: "Kampala City", subcounty: "Central Division", lat: 0.3164, lng: 32.5689, status: "functional" },
  { type: "latrine", name: "Nakivubo Public Latrine", district: "Kampala City", subcounty: "Central Division", lat: 0.3158, lng: 32.5811, status: "broken" },
];

async function main() {
  const batch = db.batch();
  for (const f of facilities) {
    const ref = db.collection("facilities").doc();
    const record: Facility = { ...f, id: ref.id, createdAt: now, updatedAt: now };
    batch.set(ref, record);
  }
  await batch.commit();
  console.log(`Seeded ${facilities.length} facilities.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
