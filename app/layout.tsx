import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutProvider } from "./components/providers/LayoutProvider";
import { AuthProvider } from "./components/providers/AuthProvider";
import AuthGate from "./components/providers/AuthGate";

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
        <AuthProvider>
          <LayoutProvider>
            <AuthGate>{children}</AuthGate>
          </LayoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}