# Deployment & Data Sovereignty

## Quick start (Docker)

```bash
cp server/.env.example server/.env   # then edit for your Firebase project
docker compose up --build
```

This builds and runs both containers (frontend on :3000, API on :4000). You still need a real Firebase project and credentials — Docker packages the *application*, not the datastore (see below for why).

## What's containerized, and what isn't

- **Frontend** (`Dockerfile`, root) — a standalone Next.js server. Self-contained, runs anywhere Docker runs.
- **Backend** (`server/Dockerfile`) — the Express API. Self-contained.
- **Data — not containerized, and can't be**: this app stores data in Firestore, a Google Cloud managed service. There is no self-hosted or on-premise version of Firestore. Standing up the two containers above gets you a running *application*; your data still lives in Google's cloud, in whichever region your Firebase project is created in, regardless of where you deploy the containers.

This is a real architectural constraint, not a configuration detail — flagging it explicitly rather than implying "containerized = on-prem = data sovereignty achieved," which it doesn't.

## What genuine data sovereignty would require

If a government or institutional customer's procurement requirement is "our citizens' data does not leave our jurisdiction / does not sit on a US-headquartered company's servers," this stack does not currently meet that bar, no matter how it's deployed. Two paths forward, in order of effort:

1. **Firestore, but region-pinned.** Firebase/GCP let you choose a Firestore location at project creation (e.g., an African or EU region if available for your GCP org). This narrows *where* the data sits but does not change *who* operates the infrastructure — it's still a Google Cloud service, still subject to Google's terms and US legal jurisdiction reach (e.g., the US CLOUD Act) regardless of physical region. This may or may not satisfy a given procurement requirement — that's a legal question, not an engineering one.
2. **Migrate off Firestore to a self-hostable database** (PostgreSQL is the natural choice given the rest of the stack) that can run entirely within a customer's own data center or a sovereign cloud region. This is a real migration — the household/facility/user/audit-log/report-job schemas would need to move from Firestore's document model to relational tables, and Firebase Auth would need replacing too (e.g., with a self-hostable alternative like Keycloak, or a custom auth service) since it has the same non-self-hostable constraint as Firestore. This is a multi-week engineering effort, not a config change, and would be the right scope for its own dedicated phase — not something to casually retrofit.

Recommendation: **surface this constraint early in any government procurement conversation**, rather than after a pilot is underway. It may be a non-issue (many pilots proceed on managed cloud infrastructure without a sovereignty requirement), but if it *is* a requirement, it changes the technical roadmap significantly and is much cheaper to plan for now than to discover after the fact.

## Uganda Data Protection and Privacy Act, 2019 — considerations

This is **not legal advice** — raise these with the customer's legal/compliance counsel before any real deployment with real beneficiary data. Flagging them here because they're directly relevant to decisions already made in this codebase:

- **Data controller/processor registration.** The Act requires organizations that collect/process personal data at scale to register with Uganda's Personal Data Protection Office (PDPO). Household beneficiary data (names, health status, GPS location, national ID numbers) is exactly the kind of data this applies to.
- **Cross-border transfer restrictions.** The Act restricts transferring personal data outside Uganda unless the destination has "adequate" data protection safeguards or specific consent/contractual conditions are met. Firestore's default deployment transfers data to Google's infrastructure, which — depending on the selected Firestore region — may constitute a cross-border transfer. This is the same underlying issue as the data-sovereignty point above, from a specific legal-compliance angle rather than a general architecture one.
- **Data minimization and purpose limitation.** Worth an explicit pass over the `Household` schema (national ID, GPS coordinates, health status, household member details) to confirm each field is actually necessary for the stated program purpose, since the Act requires collection to be limited to what's necessary.
- **Breach notification.** The Act requires notifying the PDPO and affected individuals of data breaches within a specified timeframe. Nothing in this codebase currently implements breach detection/notification — that's out of scope for what's been built so far and would need its own design.
- **Data retention.** The Settings page currently has a "Data Retention" control (`app/settings/page.tsx`, Data & Sync tab) that is UI-only — it doesn't drive any actual deletion/archival job. If retention limits become a real compliance requirement, that control needs a real backend behind it, not just a dropdown.

## Environment variables reference

See `server/.env.example` and `.env.local.example` at the repo root for the full list with inline comments. Summary:

| Variable | Where | Purpose |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON` | server | Firebase Admin SDK auth (production only — local dev uses the emulator instead) |
| `FIREBASE_PROJECT_ID` | server | Which Firebase project to connect to |
| `CORS_ORIGIN` | server | Comma-separated list of allowed frontend origins |
| `NEXT_PUBLIC_API_URL` | frontend | Where the frontend sends API requests |
| `NEXT_PUBLIC_FIREBASE_*` | frontend | Firebase client SDK config (production; emulator mode needs only `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) |

## First deployment checklist

1. Create a real Firebase project (Firestore + Authentication enabled).
2. Generate a service account key (Firebase Console → Project Settings → Service Accounts) for the backend.
3. Deploy `server/firestore.rules` — `npx firebase deploy --only firestore:rules --project <your-project-id>` (see `server/README.md`). These currently deny all direct client access; everything goes through the API.
4. Run `npm run seed:admin` once against the real project to create the first Super Admin (see `server/src/scripts/seedAdmin.ts`) — without this, there's no way to log in and no way to invite anyone else.
5. Set `CORS_ORIGIN` to your real frontend domain, not `localhost`.
6. Decide on the data-sovereignty question above *before* loading real beneficiary data, not after.
