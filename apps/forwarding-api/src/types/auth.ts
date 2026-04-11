import type { Request } from "express";

export interface AuthSession {
  userId: string;
  email: string;
}

export type AuthenticatedRequest = Request & {
  auth?: AuthSession;
  organizationId?: string;
};
