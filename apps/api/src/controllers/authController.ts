import { z } from "zod";
import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { EmailService } from "../services/emailService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});

export class AuthController {
  private readonly emailService: EmailService;

  constructor(private readonly authService: AuthService) {
    this.emailService = new EmailService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const payload = registerSchema.parse(req.body);
    const auth = await this.authService.register(payload);
    res.status(201).json(auth);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = loginSchema.parse(req.body);
    const auth = await this.authService.login(payload);
    res.json(auth);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const token = await this.authService.forgotPassword(email);

    if (token) {
      await this.emailService.sendPasswordReset(email, token);
    }

    // Always return success to prevent email enumeration
    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await this.authService.resetPassword(token, newPassword);
    res.json({ message: "Password has been reset. You can now log in with your new password." });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication is required." });
      return;
    }
    const payload = changePasswordSchema.parse(req.body);
    await this.authService.changePassword(userId, payload);
    res.json({ message: "Password changed successfully." });
  });
}
