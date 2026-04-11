import { Router } from "express";
import { OrganizationController } from "../controllers/organizationController.js";

export const createOrganizationRouter = (controller: OrganizationController) => {
  const router = Router();
  router.post("/bootstrap", controller.bootstrap);
  router.get("/me", controller.getMine);
  return router;
};
