"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebaseClient";
import { api } from "../../lib/api";
import type { UserRole } from "../../lib/types";

interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  status: "Active" | "Inactive" | "Pending";
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: AppUserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const { data } = await api.get<{ data: AppUserProfile }>("/api/users/me");
          setProfile(data);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!firebaseUser && !isPublic) {
      router.replace("/login");
    } else if (firebaseUser && isPublic) {
      router.replace("/");
    }
  }, [loading, firebaseUser, pathname, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(firebaseAuth);
    router.replace("/login");
  }, [router]);

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, role, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
