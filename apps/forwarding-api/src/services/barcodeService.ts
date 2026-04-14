import { readBarcodesFromImageFile } from "zxing-wasm/reader";
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
 */

const SHIPPING_FORMATS = [
  "Code128",
  "QRCode",
  "DataMatrix",
  "Code39",
  "EAN-13",
  "PDF417"
] as const;

export interface BarcodeDecode {
  raw: string;
  format: string;
}

export class BarcodeService {
  async decode(buffer: Buffer): Promise<BarcodeDecode | null> {
    try {
      // zxing-wasm wants a Blob. Node 18+ has native Blob.
      const blob = new Blob([new Uint8Array(buffer)]);
      const results = await readBarcodesFromImageFile(blob, {
        formats: [...SHIPPING_FORMATS],
        tryInvert: true,
        tryRotate: true,
        returnErrors: false
      });

      const valid = results.filter((result) => result.isValid && result.text);
      if (valid.length === 0) {
        return null;
      }

      // Prefer a barcode whose decoded text matches a known carrier tracking
      // format (UPS 1Z..., USPS 9x..., FedEx 12/15 digit, DHL 10 digit).
      // Fall back to the first decoded barcode if nothing matches — the
      // downstream service still handles the "decoded something but not
      // recognized" case via OCR fallback.
      const tracking = valid.find((result) => inferCarrierFromBarcode(result.text) !== null);
      const chosen = tracking ?? valid[0];

      return {
        raw: chosen.text,
        format: chosen.format
      };
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
}
