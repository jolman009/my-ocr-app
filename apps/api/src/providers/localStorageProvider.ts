import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import type { StorageProvider } from "./storageProvider.js";

export class LocalStorageProvider implements StorageProvider {
  async save(buffer: Buffer, extension = "png"): Promise<string> {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }
}
