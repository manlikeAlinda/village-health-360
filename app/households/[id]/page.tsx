import UserProfile from "./UserProfile";

// This function generates the static HTML files at build time.
// We list all the IDs that exist in your directory mock data.
export async function generateStaticParams() {
  return [
    { id: "HH-001" },
    { id: "HH-002" },
    { id: "HH-003" },
    { id: "HH-004" },
    { id: "HH-8291" },
  ];
}

export default function Page() {
  return <UserProfile />;
}