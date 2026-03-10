import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

  verifyToken(token: string) {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    return {
      userId: payload.sub,
      email: payload.email
    };
  }
}
