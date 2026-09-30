# Data Sources

## Administrative hierarchy (districts, subcounties)

**Source:** [Uganda - Subnational Administrative Boundaries (COD-AB)](https://data.humdata.org/dataset/cod-ab-uga), Humanitarian Data Exchange (HDX).
- Publisher: Uganda Bureau of Statistics, with support from WHO / ITOS / USAID.
- File used: `uga_admin_boundaries.xlsx` (attribute table only, no GIS geometry needed).
- Dataset version: v01. Last reviewed by the source 2025-01-28. Retrieved 2026-09-06.

**What's real vs. patched:**
- `admin2` sheet (135 rows) = District. `admin4` sheet (1,520 rows) = Subcounty. (The dataset's own metadata description calls `admin3`/`admin4` "sub-county, parish, village" — that's inaccurate for this file; `admin3` is actually County, and `admin4` is Subcounty. No parish- or village-level data exists in this resource.)
- District → Subcounty is a direct join on `admin4.adm2_name`. All 135 HDX districts have at least one subcounty; no gaps.
- **10 districts split into a City + a rural remainder** (Kampala, Masaka, Jinja, Mbale, Soroti, Lira, Gulu, Arua, Hoima, Mbarara) reflect a real administrative pattern: cities were carved out of an existing district's urban core after this HDX snapshot's district list was frozen, but their constituent "Division" subcounties are still tagged under the parent district in this data. Split rule applied: any admin4 name containing "Division" (or the source's own typo "Divison") → the City; everything else → the rural district. Verified this holds for all 10 cases before applying it (e.g. Gulu → Awach/Bungatira/Paicho/Palaro/Patiko/Unyama; Gulu City → Bar Dege/Laroo/Layibi/Pece Division). Kampala has no rural remainder (100% urban), matching how the app already modeled it.
- **Terego District** (created 2020, after this HDX snapshot's district list was frozen) has no HDX entry. Its 6 subcounties (Aii-Vu, Bileafe, Katrini, Omugo, Udupi, Uriama) are sourced from [Wikipedia: Terego District](https://en.wikipedia.org/wiki/Terego_District), fetched 2026-09-06.
- **Kassanda District** genuinely exists in this HDX snapshot with real subcounty data — no fallback needed. (Kasanda/Kassanda spelling note below.)

**Two pre-existing bugs in the app's own data fixed during this pass, not introduced by it:**
1. The district list had **both** "Kassanda" and "Kasanda" as if they were separate districts — they're the same place (just an inconsistent spelling in one array). Kept "Kassanda" (matches the official gazette and Wikipedia's canonical title), dropped the duplicate.
2. **Bunyangabu District** (Tooro subregion, real district since 2019) was missing from the app's district list entirely. Added, with real HDX subcounty data.

**Known data-quality caveats inherited from the source (not corrected):** the HDX attribute table itself contains inconsistent spelling/typos in a small number of subcounty names — e.g. "Divison" instead of "Division" (Kotido, Koboko, Bugiri, and others), "Twon Council" (Sheema), "Councili" (Bundibugyo), "Kahoora Divison" / "Mparo Divison" (Hoima). These were left as-sourced rather than silently "corrected," since this project has no primary access to UBOS's authoritative current spelling — flagging it here so a future pass with real UBOS access can reconcile it, rather than an AI-guessed fix passing as fact.

**Refresh/versioning plan:** Uganda's local government boundaries change periodically (new districts and cities are gazetted every few years — Kasanda/Bunyangabu/Terego above were all created since this HDX file's 135-district baseline). This data will drift. Before any government pilot or procurement conversation, re-pull the current COD-AB release from HDX (same URL) and re-run the join in `app/lib/adminData.ts` / `app/lib/subcountyData.json`; diff against the previous district list the way this pass did, rather than assuming no changes occurred. There is currently no automated refresh — this is a manual, occasional data-engineering task, not a live sync.

**Not sourced (out of scope for this pass):** parish and village level. Uganda has roughly 7,000+ parishes and 70,000+ villages; no freely available, structured, nationwide dataset at that granularity was found in this pass. The household registration form still asks for parish/village as free text rather than fabricating a dropdown for data that doesn't exist yet.

## County level (added later, for `household.location.county_id`)

**Source:** [Counties of Uganda](https://en.wikipedia.org/wiki/Counties_of_Uganda), Wikipedia. Fetched 2026-09-17.
- Covers 115 of this app's 145 districts. The other 30 (`app/lib/countyData.json` has no entry for them) are districts gazetted after this Wikipedia list's snapshot — no invented county data was written for them; `getCounties()` returns `[]` and the form falls back to free text, same pattern as parish/village below.
- The 10 districts this app splits into City + rural remainder (see above) needed the same split applied to their counties: any Wikipedia entry containing "Municipal Council" or "Capital City" was attributed to the "X City" district, the rest to the rural "X" district.
- `district_id`/`county_id`/`subcounty_id`/`parish_id` are a deterministic slug of the real name (`app/lib/adminData.ts`'s `slugify()`), used as a stable local identifier — **not** an official Uganda government P-code. No verified source for real P-codes was available in this pass.

## Parish level (added later, for `household.location.parish_id`)

**Source:** web search snippets (Wikipedia-derived), fetched 2026-09-17. Only two subcounties are covered, as a real (not fabricated) sample rather than a nationwide dataset:
- Kira Division, Wakiso: Kimwanyi, Kira, Kyaliwajjala, Kireka, Bweyogerere, Kirinnya.
- Awach, Gulu: Gwengdiya, Paduny, Paibona, Pukony.

Every other district/subcounty combination has no parish data (`getParishes()` returns `[]`); the form falls back to free text. Village has no reference dataset at all anywhere in the app — `village_id` is simply the operator's typed value, not a lookup.
