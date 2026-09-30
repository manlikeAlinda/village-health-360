import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

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

// firebaseAuth is only ever used from client components (every call site is
// inside an effect/handler/async function — see the importers), but
// getAuth() validates the config immediately. Creating it eagerly at module
// scope crashes Next.js's server-side prerender when real Firebase env vars
// aren't set (e.g. a Vercel build without NEXT_PUBLIC_FIREBASE_* configured
// yet), because the module graph still gets evaluated on the server even for
// client-only components. Deferring creation to first real property access —
// which only ever happens in the browser — avoids that without changing any
// call site.
let authInstance: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    if (usingEmulator) {
      // Guard against Next.js Fast Refresh re-running this module and
      // reconnecting twice (the module-level authInstance above also resets
      // on Fast Refresh, but the underlying Firebase app doesn't).
      const g = globalThis as unknown as { __authEmulatorConnected?: boolean };
      if (!g.__authEmulatorConnected) {
        connectAuthEmulator(authInstance, "http://localhost:9099", { disableWarnings: true });
        g.__authEmulatorConnected = true;
      }
    }
  }
  return authInstance;
}

export const firebaseAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseAuth(), prop, receiver);
  },
});
