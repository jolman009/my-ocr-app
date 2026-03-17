import { writeFileSync } from "node:fs";
import { ImageAnnotatorClient, protos } from "@google-cloud/vision";
import type { OcrProvider } from "./ocrProvider.js";
import type { OcrBlock, OcrResult } from "../types/receipt.js";
import { env } from "../config/env.js";

export class GoogleVisionOcrProvider implements OcrProvider {
  private client: ImageAnnotatorClient;

  constructor() {
    if (env.GOOGLE_CREDENTIALS_JSON) {
      const decoded = Buffer.from(env.GOOGLE_CREDENTIALS_JSON, "base64").toString("utf-8");
      const creds = JSON.parse(decoded);
      this.client = new ImageAnnotatorClient({ credentials: creds });
    } else {
      this.client = new ImageAnnotatorClient();
    }
  }

  async extractReceiptText(input: Buffer | string): Promise<OcrResult> {
    const image = typeof input === "string" ? { source: { imageUri: input } } : { content: input.toString("base64") };
    const [response] = await this.client.documentTextDetection({ image });
    const fullText = response.fullTextAnnotation?.text ?? "";
    const blocks: OcrBlock[] = [];
    const pages: protos.google.cloud.vision.v1.IPage[] = response.fullTextAnnotation?.pages ?? [];

    for (const page of pages) {
      for (const block of page.blocks ?? []) {
        for (const paragraph of block.paragraphs ?? []) {
          const words = paragraph.words ?? [];
          const text = words
            .map((word) => (word.symbols ?? []).map((symbol) => symbol.text).join(""))
            .join(" ")
            .trim();

          if (!text) {
            continue;
          }

          blocks.push({
            text,
            confidence: paragraph.confidence ?? block.confidence ?? undefined,
            type: "line",
            vertices: block.boundingBox?.vertices?.map((vertex) => ({ x: vertex.x ?? 0, y: vertex.y ?? 0 }))
          });
        }
      }
    }

    return {
      rawText: fullText,
      lines: fullText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      blocks,
      raw: response
    };
  }
}