import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AWS S3 client before importing the provider
const sendMock = vi.fn().mockResolvedValue({});
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = sendMock;
    },
    PutObjectCommand: class {
      constructor(public params: any) {}
    }
  };
});

// We need to mock the env config dynamically
vi.mock("../src/config/env.js", () => {
  return {
    env: {
      S3_BUCKET: "my-test-bucket",
      AWS_REGION: "us-west-1",
      S3_ENDPOINT: undefined,
      S3_PUBLIC_BASE_URL: undefined,
      S3_ACCESS_KEY_ID: "fake-key",
      S3_SECRET_ACCESS_KEY: "fake-secret"
    }
  };
});

import { S3StorageProvider } from "../src/providers/s3StorageProvider.js";
import { env } from "../src/config/env.js";

describe("S3StorageProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.S3_BUCKET = "my-test-bucket";
    env.AWS_REGION = "us-west-1";
    env.S3_ENDPOINT = undefined;
    env.S3_PUBLIC_BASE_URL = undefined;
  });

  it("should format AWS default urls correctly", async () => {
    const provider = new S3StorageProvider();
    const url = await provider.save(Buffer.from("fake image"), "jpg");
    
    expect(sendMock).toHaveBeenCalledOnce();
    const commandArg = sendMock.mock.calls[0][0];
    expect(commandArg.params.Bucket).toBe("my-test-bucket");
    expect(commandArg.params.ContentType).toBe("image/jpg");
    expect(url).toMatch(/^https:\/\/my-test-bucket\.s3\.us-west-1\.amazonaws\.com\/receipts\/\d+-[\w-]+\.jpg$/);
  });

  it("should format custom S3_PUBLIC_BASE_URL correctly", async () => {
    env.S3_PUBLIC_BASE_URL = "https://cdn.my-ocr.com";
    const provider = new S3StorageProvider();
    const url = await provider.save(Buffer.from("fake image"), "png");
    
    expect(url).toMatch(/^https:\/\/cdn\.my-ocr\.com\/receipts\/\d+-[\w-]+\.png$/);
  });
});
