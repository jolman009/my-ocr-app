import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/auth.js";

/**
 * Thin JWT verifier. Both forwarding-api and the receipt-radar API share the
 * JWT contract — same secret, same payload shape — but each app verifies
 * independently so they don't have to import each other's auth code.
 */
const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice("Bearer ".length);
};

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    req.auth = { userId: payload.sub, email: payload.email };
  } catch {
    // Invalid token — leave req.auth unset; requireAuth will reject if needed.
  }
  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!env.AUTH_REQUIRED) {
    next();
    return;
  }

  if (!req.auth?.userId) {
    res.status(401).json({ message: "Authentication is required." });
    return;
  }

  next();
};
