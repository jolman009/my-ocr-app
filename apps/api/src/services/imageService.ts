import sharp from "sharp";
import type { StorageProvider } from "../providers/storageProvider.js";

export class ImageService {
  constructor(private readonly storageProvider: StorageProvider) {}

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
    return this.storageProvider.save(buffer, "png");
  }
}
