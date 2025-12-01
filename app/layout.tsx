import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VillageHealth360 | Rural Intelligence",
  description: "National Health & WASH Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-bg text-gray-900`}>
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <Sidebar />
          
          {/* Main Content Area - Shifted right to accommodate fixed Sidebar */}
          <main className="flex-1 md:ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}