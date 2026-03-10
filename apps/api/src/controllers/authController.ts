import { z } from "zod";
import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
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

export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
