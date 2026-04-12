import type { NextFunction, Response } from "express";
import { OrganizationRepository } from "../repositories/organizationRepository.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { HttpError } from "../utils/httpError.js";

/**
 * Resolves the authenticated user's organization and attaches organizationId
 * to the request. Returns 401 if no authed user, 400 if the user has never
 * bootstrapped an org (i.e., the mobile client should call /forwarding/
 * organizations/bootstrap first).
 *
 * Every data endpoint that reads or writes forwarding tables MUST be behind
 * this middleware — it's the load-bearing piece of multi-tenant isolation.
 */
export const createRequireOrgContext = (organizationRepository: OrganizationRepository) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
      next(new HttpError(401, "Authentication is required."));
      return;
    }

    try {
      const membership = await organizationRepository.findFirstByUserId(req.auth.userId);
      if (!membership) {
        next(
          new HttpError(
            400,
            "No organization found. Call POST /forwarding/organizations/bootstrap first."
          )
        );
        return;
      }

      req.organizationId = membership.organization.id;
      next();
    } catch (error) {
      next(error);
    }
  };
};
