import type { NextFunction, Response } from "express";
import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { AuthService } from "../services/authService.js";

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
};

export const createAuthenticate = (authService: AuthService) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      next();
      return;
    }

    try {
      req.auth = authService.verifyToken(token);
      next();
    } catch {
      next();
    }
  };
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
