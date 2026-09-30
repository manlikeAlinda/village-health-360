import { redirect } from "next/navigation";

// WASH was merged into the Health & WASH overview page — see app/health/page.tsx.
export default function WashRedirect() {
  redirect("/health");
}
