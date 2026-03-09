import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { env } from "../config/env.js";

export class ImageService {
  async preprocess(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .png()
      .toBuffer();
  }

  async save(buffer: Buffer): Promise<string> {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${Date.now()}-${randomUUID()}.png`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }
}