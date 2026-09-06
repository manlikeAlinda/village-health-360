import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID || "village-health-360-dev";

if (getApps().length === 0) {
  const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

  if (usingEmulator) {
    // Emulator mode: no real credentials needed, just a project ID to namespace data.
    initializeApp({ projectId });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Production: relies on a service account key file path in this env var.
    initializeApp({ credential: applicationDefault(), projectId });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Production alternative: full service account JSON passed as an env var
    // (e.g. Vercel/Cloud Run secret) rather than a file path.
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({ credential: cert(serviceAccount), projectId });
  } else {
    throw new Error(
      "No Firebase credentials found. Set FIRESTORE_EMULATOR_HOST for local dev, " +
      "or GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_JSON for production."
    );
  }
}

export const db = getFirestore();
// Routes pass optional fields (subcounty, district, phone, etc.) straight through
// from validated input; Firestore otherwise rejects any `undefined` value outright.
db.settings({ ignoreUndefinedProperties: true });
export const auth = getAuth();
