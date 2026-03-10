import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import type { StorageProvider } from "./storageProvider.js";
import { HttpError } from "../utils/httpError.js";

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;

  constructor() {
    if (!env.S3_BUCKET) {
      throw new HttpError(500, "S3_BUCKET is required when STORAGE_PROVIDER is s3.");
    }

    this.client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials:
        env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.S3_ACCESS_KEY_ID,
              secretAccessKey: env.S3_SECRET_ACCESS_KEY
            }
          : undefined
    });
  }

  async save(buffer: Buffer, extension = "png"): Promise<string> {
    const key = `receipts/${Date.now()}-${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: `image/${extension}`
      })
    );

    if (env.S3_PUBLIC_BASE_URL) {
      return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
    }

    if (env.S3_ENDPOINT) {
      return `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}/${key}`;
    }

    return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
