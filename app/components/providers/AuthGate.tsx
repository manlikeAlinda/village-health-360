"use client";

import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import TopBar from "../layout/TopBar";
import { useAuth } from "./AuthProvider";

// Renders the login page bare (no sidebar/topbar chrome), and gates the rest of
// the app behind auth so the app shell doesn't flash before the redirect to
// /login (or back to /) resolves.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, firebaseUser } = useAuth();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (loading || !firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="flex-1 md:ml-64 p-8">{children}</main>
    </div>
  );
}
