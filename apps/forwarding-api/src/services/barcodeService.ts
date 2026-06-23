import { readBarcodesFromImageFile, type ReadResult } from "zxing-wasm/reader";
import sharp from "sharp";
import { inferCarrierFromBarcode } from "../utils/trackingNumberExtractor.js";

/**
 * Reads barcodes/QR codes from an image buffer using zxing-wasm.
 * Returns the best-looking valid decode result, or null if none found.
 *
 * Tuned for shipping labels — Code128 is by far the most common on UPS,
 * USPS, and FedEx labels. QRCode covers DHL/Amazon, DataMatrix covers
 * some carrier internal codes. PDF417 covers some USPS tracking blocks.
 *
 * Shipping labels routinely carry multiple barcodes (tracking, routing,
 * weight, package-identifier). zxing's detection order is not guaranteed,
 * so we prefer a barcode whose decoded text matches a known carrier
 * tracking format over an arbitrary first-hit — otherwise a stray routing
 * code can get stored as the "tracking number" and the search endpoint
 * never finds it by the printed number.
 *
 * Resolution matters: the dense Code128 tracking barcode often fails to
 * decode on a small image while the coarser routing barcode still reads.
 * When the first pass finds no carrier-tracking match, we retry once on an
 * upscaled copy before giving up to the OCR fallback. The retry only runs on
 * a miss, so a normal high-res device capture (resized to 1800px wide by the
 * mobile app) pays nothing.
 */

const SHIPPING_FORMATS = [
  "Code128",
  "QRCode",
  "DataMatrix",
  "Code39",
  "EAN-13",
  "PDF417"
] as const;

// Below this width the tracking barcode commonly fails to decode; at/above it
// the upscale-retry isn't worth the CPU (and won't add real detail anyway).
const UPSCALE_MIN_WIDTH = 1600;
// Cap so we never blow up an already-large image into a huge buffer.
const UPSCALE_MAX_WIDTH = 3200;

export interface BarcodeDecode {
  raw: string;
  format: string;
}

export class BarcodeService {
  async decode(buffer: Buffer): Promise<BarcodeDecode | null> {
    try {
      const first = await this.readValid(buffer);
      const firstTracking = first.find((r) => inferCarrierFromBarcode(r.text) !== null);
      if (firstTracking) {
        return toDecode(firstTracking);
      }

      // No carrier tracking number on the first pass — the real tracking
      // barcode may just be too small/dense to decode at this resolution.
      // Retry once on an upscaled copy.
      const upscaled = await this.upscale(buffer);
      if (upscaled) {
        const second = await this.readValid(upscaled);
        const secondTracking = second.find((r) => inferCarrierFromBarcode(r.text) !== null);
        if (secondTracking) {
          return toDecode(secondTracking);
        }
        // Still nothing recognizable as a tracking number. Keep the best
        // first-pass decode (faithful to the as-uploaded image); otherwise
        // whatever the retry managed to read.
        const fallback = first[0] ?? second[0];
        return fallback ? toDecode(fallback) : null;
      }

      return first[0] ? toDecode(first[0]) : null;
    } catch (error) {
      // Wasm init failures, corrupted images, etc. — treat as "no barcode"
      // so the upstream pipeline falls back to OCR extraction. Log in dev
      // so recurring decode failures are visible.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[barcode] decode error:", error instanceof Error ? error.message : error);
      }
      return null;
    }
  }

  private async readValid(buffer: Buffer): Promise<ReadResult[]> {
    // zxing-wasm wants a Blob. Node 18+ has native Blob.
    const blob = new Blob([new Uint8Array(buffer)]);
    const results = await readBarcodesFromImageFile(blob, {
      formats: [...SHIPPING_FORMATS],
      tryInvert: true,
      tryRotate: true,
      returnErrors: false
    });
    return results.filter((result) => result.isValid && result.text);
  }

  /**
   * Returns a 2× upscaled copy when the source is small enough to benefit, or
   * null when it's already large (upscaling can't add detail and risks memory
   * blowups). A failed resize also yields null — the caller just stops retrying.
   */
  private async upscale(buffer: Buffer): Promise<Buffer | null> {
    try {
      const { width } = await sharp(buffer).metadata();
      if (!width || width >= UPSCALE_MIN_WIDTH) {
        return null;
      }
      const target = Math.min(width * 2, UPSCALE_MAX_WIDTH);
      return await sharp(buffer).resize({ width: target }).png().toBuffer();
    } catch {
      return null;
    }
  }
}

const toDecode = (result: ReadResult): BarcodeDecode => ({
  raw: result.text,
  format: result.format
});
