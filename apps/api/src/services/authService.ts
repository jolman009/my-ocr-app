import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { UserRepository } from "../repositories/userRepository.js";
import { HttpError } from "../utils/httpError.js";

const createToken = (user: { id: string; email: string }) =>
  jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: "7d" });

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(input: { email: string; password: string; name?: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, "A user with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash
    });

    return {
      token: createToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password.");
    }

    return {
      token: createToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const user = await this.users.findById(userId);
    if (!user?.passwordHash) {
      throw new HttpError(404, "User not found.");
    }

    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Current password is incorrect.");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await this.users.updatePassword(userId, passwordHash);
  }

  async forgotPassword(email: string): Promise<string | null> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return null;
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.users.setResetToken(user.id, tokenHash, expiresAt);
    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const user = await this.users.findByResetToken(tokenHash);

    if (!user) {
      throw new HttpError(400, "Invalid or expired reset link.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.users.updatePassword(user.id, passwordHash);
  }

  async googleLogin(idToken: string) {
    const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      throw new HttpError(500, "Google Sign-in is not configured.");
    }

    const client = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, "Invalid Google token.");
    }

    if (!payload?.email) {
      throw new HttpError(401, "Google token missing email.");
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name ?? null;

    // Check if user exists by googleId or email
    let user = await this.users.findByGoogleId(googleId);
    if (!user) {
      user = await this.users.findByEmail(email);
      if (user) {
        // Link existing email account to Google
        user = await this.users.linkGoogle(user.id, googleId);
      } else {
        // Create new user
        user = await this.users.create({
          email,
          name: name ?? undefined,
          googleId,
          authProvider: "google"
        });
      }
    }

    return {
      token: createToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  verifyToken(token: string) {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    return {
      userId: payload.sub,
      email: payload.email
    };
  }
}
