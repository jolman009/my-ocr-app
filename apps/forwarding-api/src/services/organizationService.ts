import { OrganizationRepository, type OrganizationWithRole } from "../repositories/organizationRepository.js";
import { HttpError } from "../utils/httpError.js";

const slugify = (value: string): string => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  // Append a short random suffix so slugs don't collide for "Acme" + "Acme".
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `workspace-${suffix}`;
};

export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  /**
   * Returns the user's first organization, creating one if they don't have any.
   * Called by the mobile app on first launch (the bootstrap pattern).
   */
  async bootstrapForUser(input: {
    userId: string;
    userName?: string | null;
    userEmail: string;
  }): Promise<OrganizationWithRole> {
    const existing = await this.repository.findFirstByUserId(input.userId);
    if (existing) {
      return existing;
    }

    const displayName = input.userName?.trim() || input.userEmail.split("@")[0];
    const orgName = `${displayName}'s Workspace`;
    const slug = slugify(displayName);

    return this.repository.createWithOwner({
      userId: input.userId,
      name: orgName,
      slug
    });
  }

  /**
   * Returns the current user's organization, throwing 404 if they have none.
   * Use this from endpoints that require an org to already exist.
   */
  async getMyOrganization(userId: string): Promise<OrganizationWithRole> {
    const membership = await this.repository.findFirstByUserId(userId);
    if (!membership) {
      throw new HttpError(404, "No organization found for this user. Call /forwarding/bootstrap first.");
    }
    return membership;
  }
}
