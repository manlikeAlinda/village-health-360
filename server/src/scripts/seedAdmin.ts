import "dotenv/config";
import { auth, db } from "../lib/firebase";
import { AppUser } from "../types";

// Bootstraps the first Super Admin account. Needed because every other way to
// create a user (POST /api/users) requires already being a Super Admin/District
// Admin — this breaks that chicken-and-egg problem for a fresh environment.
//
// Usage: SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... SEED_ADMIN_NAME="..." npm run seed:admin

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars before running this script.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Found existing Auth user ${userRecord.uid} for ${email}`);
  } catch {
    userRecord = await auth.createUser({ email, password, displayName: name });
    console.log(`Created Auth user ${userRecord.uid} for ${email}`);
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: "Super Admin" });

  const now = new Date().toISOString();
  const profile: AppUser = {
    id: userRecord.uid,
    name,
    email,
    role: "Super Admin",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  };
  await db.collection("users").doc(userRecord.uid).set(profile, { merge: true });

  console.log(`Super Admin ready: ${email} (uid: ${userRecord.uid})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
