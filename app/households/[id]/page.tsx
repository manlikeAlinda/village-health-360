import UserProfile from "./UserProfile";

// 1. Define the list of IDs to pre-render
export async function generateStaticParams() {
  return [
    { id: "HH-GUL-001" },
    { id: "HH-GUL-002" },
    { id: "HH-GUL-003" },
    { id: "HH-GUL-004" },
    { id: "HH-GUL-005" },
    { id: "HH-8291" },
  ];
}

// 2. The Page Component receives 'params' automatically
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // 3. We extract the ID and pass it to the Client Component
  const { id } = await params;

  return <UserProfile id={id} />;
}