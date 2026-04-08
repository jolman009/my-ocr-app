import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

export const createAuthRouter = (controller: AuthController) => {
  const router = Router();
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/change-password", controller.changePassword);
  router.post("/google", controller.googleLogin);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);
  return router;
};
