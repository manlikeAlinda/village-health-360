import { NextFunction, Request, Response } from "express";
import { auth, db } from "../lib/firebase";
import { ApiError } from "./errorHandler";
import { AppUser, UserRole } from "../types";

export interface AuthedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

// Role order used for "at least this level" checks (requireRole is still the
// primary tool — this exists for the few places that need a ranking, e.g. "Field
// Agent or above").
export const ROLE_RANK: Record<UserRole, number> = {
  "Viewer": 0,
  "Partner": 1,
  "Field Agent": 2,
  "Health Officer": 3,
  "District Admin": 4,
  "Super Admin": 5,
};

export function isAtLeast(role: UserRole, minRole: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing Authorization header");
    }
    const token = header.slice("Bearer ".length);
    const decoded = await auth.verifyIdToken(token);

    const profileDoc = await db.collection("users").doc(decoded.uid).get();
    if (!profileDoc.exists) {
      throw new ApiError(403, "No user profile found for this account — ask an admin to create one");
    }
    const profile = profileDoc.data() as AppUser;
    if (profile.status !== "Active") {
      throw new ApiError(403, `Account is ${profile.status.toLowerCase()}, not active`);
    }

    req.user = { uid: decoded.uid, email: profile.email, name: profile.name, role: profile.role };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(...allowed: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!allowed.includes(req.user.role)) {
      return next(new ApiError(403, `Requires one of: ${allowed.join(", ")}`));
    }
    next();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (ROLE_RANK[req.user.role] < ROLE_RANK[minRole]) {
      return next(new ApiError(403, `Requires ${minRole} or above`));
    }
    next();
  };
}
