// Mirrors app/lib/adminData.ts's slugify() — kept in sync by hand, same as
// the Household type. Used to convert a district/county/subcounty display
// name (what the frontend's admin-hierarchy selects send) into the slug
// stored as household.location.district_id etc.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
