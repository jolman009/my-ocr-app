import { Router, type RequestHandler } from "express";
import { CustomerAccountController } from "../controllers/customerAccountController.js";

export const createCustomerAccountRouter = (
  controller: CustomerAccountController,
  requireOrgContext: RequestHandler
) => {
  const router = Router();
  router.post("/", requireOrgContext, controller.create);
  router.get("/", requireOrgContext, controller.list);
  return router;
};
