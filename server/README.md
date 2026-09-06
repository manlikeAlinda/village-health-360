# Village Health 360 — API

Express + TypeScript backend, Firestore for data, Firebase Auth for identity (auth wiring lands in Phase 2 — this phase is data persistence only).

## Local development (Firestore emulator, no real Google Cloud project needed)

Requires Java 21+ (the Firestore emulator refuses to start on Java 17 or older).

```bash
npm install
cp .env.example .env
npm run emulators   # terminal 1 — starts Firestore + Auth emulators, UI at http://localhost:4001
npm run dev          # terminal 2 — starts the API at http://localhost:4000
```

Then point the frontend at it: in the repo root, `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local` (see `.env.local.example`).

Emulator data is wiped when the emulator process stops — that's expected for local dev.

## Production

You'll need a real Firebase project with Firestore enabled. Two ways to authenticate:

- `GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json` — a service account key file.
- `FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'` — the same JSON inlined as an env var (for platforms like Vercel/Cloud Run where you set secrets, not files).

Do not set `FIRESTORE_EMULATOR_HOST` in production — its presence is what switches this app into emulator mode.

Deploy real Firestore security rules (`firestore.rules` currently denies all direct client access — everything goes through this API) with:

```bash
npx firebase deploy --only firestore:rules --project <your-real-project-id>
```

## What's real vs. not yet

- Households: full CRUD, persisted in Firestore. Real.
- Facilities, personnel, admin-hierarchy, integration-status, audit-log: TypeScript interfaces defined in `src/types/index.ts`, no routes built yet — that's tracked for later phases, not silently mocked.
- Auth: none yet. Every route is open. Do not deploy this publicly until Phase 2 (Firebase Auth + RBAC enforcement) lands — see the project's phased task list.
