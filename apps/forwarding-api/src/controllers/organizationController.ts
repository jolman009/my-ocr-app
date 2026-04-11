import type { Response } from "express";
import { OrganizationService } from "../services/organizationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  bootstrap = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) {
      throw new HttpError(401, "Authentication is required.");
    }

    const result = await this.organizationService.bootstrapForUser({
      userId: req.auth.userId,
      userEmail: req.auth.email
    });

    res.json({
      organization: result.organization,
      role: result.role
    });
  });

  getMine = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) {
      throw new HttpError(401, "Authentication is required.");
    }

    const result = await this.organizationService.getMyOrganization(req.auth.userId);
    res.json({
      organization: result.organization,
      role: result.role
    });
  });
}
