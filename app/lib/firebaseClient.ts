import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Emulator mode needs only a project ID — no real API key required.
// Set NEXT_PUBLIC_FIREBASE_* env vars for a real project in production.
const usingEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const firebaseConfig: FirebaseOptions = usingEmulator
  ? { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "village-health-360-dev", apiKey: "emulator" }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

if (usingEmulator && typeof window !== "undefined") {
  // Guard against Next.js Fast Refresh re-running this module and reconnecting twice.
  const g = globalThis as unknown as { __authEmulatorConnected?: boolean };
  if (!g.__authEmulatorConnected) {
    connectAuthEmulator(firebaseAuth, "http://localhost:9099", { disableWarnings: true });
    g.__authEmulatorConnected = true;
  }
}
